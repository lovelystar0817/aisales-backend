import puppeteer from 'puppeteer';
import { CallAnalysis } from '../../models/CallAnalysis.js';
import type { FastifyRequest } from 'fastify';
import { Company } from '../../models/Company.js';
import { isProdOrStaging } from '../../env.js';

/**
 * Generate PDF for a CallAnalysis assessment
 * @param analysisId - The ID of the CallAnalysis record
 * @param request - Optional Fastify request object to extract frontend URL from headers
 * @returns PDF buffer
 * @throws Error if analysis not found or PDF generation fails
 */
export async function generateCallAnalysisPdf(
  analysisId: string,
  request?: FastifyRequest,
): Promise<Buffer> {
  // Fetch the CallAnalysis record
  const callAnalysis = await CallAnalysis.findById(analysisId).lean();

  if (!callAnalysis) {
    throw new Error(`CallAnalysis not found: ${analysisId}`);
  }

  // Check if assessment is completed
  if (!callAnalysis.assessment && !callAnalysis.msigAssessment) {
    throw new Error('Assessment not yet completed');
  }

  // Fetch company to get friendlyId for guest auth
  const company = await Company.findById(callAnalysis.company)
    .select('friendlyId')
    .lean();

  if (!company || !company.friendlyId) {
    throw new Error('Company or friendlyId not found');
  }

  // Get frontend URL from request headers (origin or referer) or fall back to environment
  let frontendUrl: string;
  if (request) {
    const origin = request.headers.origin;
    const referer = request.headers.referer;
    console.log('origin', origin);
    console.log('referer', referer);

    if (origin) {
      frontendUrl = origin;
    } else if (referer) {
      // Extract origin from referer URL
      const refererUrl = new URL(referer);
      frontendUrl = `${refererUrl.protocol}//${refererUrl.host}`;
    } else {
      // Fallback to localhost for development
      frontendUrl = 'http://localhost:5361';
    }
  } else {
    // When called from admin endpoint without request context
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5361';
  }

  // Pass company friendlyId to frontend for guest auth
  const printPageUrl = `${frontendUrl}/call-analysis/assessment/${analysisId}/print?companyFriendlyId=${encodeURIComponent(company.friendlyId)}`;

  console.log(`Generating PDF for analysis: ${analysisId}`);
  console.log(`Frontend URL: ${frontendUrl}`);

  // Set environment variables to completely disable crashpad
  if (isProdOrStaging) {
    process.env.CHROME_DEVEL_SANDBOX = '';
    process.env.CHROME_CRASHPAD_PIPE_NAME = '';
    process.env.BREAKPAD_DUMP_LOCATION = '/tmp';
  }

  // Try multiple Chrome executables in order of preference
  const chromeExecutables = isProdOrStaging
    ? [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
      ]
    : [undefined];

  let browser: puppeteer.Browser | null = null;
  let lastError: Error | null = null;

  for (const executablePath of chromeExecutables) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-crash-reporter',
          '--disable-extensions',
          `--user-data-dir=/tmp/chrome-user-data-${Date.now()}-${Math.random()}`,
        ],
        executablePath,
        timeout: 30000,
      });
      console.log(
        `Successfully launched browser with: ${executablePath || 'bundled chromium'}`,
      );
      break;
    } catch (error) {
      console.warn(
        `Failed to launch with ${executablePath || 'bundled chromium'}:`,
        error instanceof Error ? error.message : error,
      );
      lastError = error instanceof Error ? error : new Error(String(error));
      if (browser) {
        try {
          await browser.close();
        } catch {}
        browser = null;
      }
    }
  }

  if (!browser) {
    throw new Error(
      `Failed to launch any browser executable. Last error: ${lastError?.message}`,
    );
  }

  try {
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    // Set user agent to avoid potential blocking
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    // Use secret-based authentication for PDF generation
    const headers: Record<string, string> = {
      'X-PDF-Secret': process.env.ADMIN_SECRET || 'fallback-secret',
      'X-PDF-User-ID': callAnalysis.user.toString(),
      'X-PDF-Company-ID': callAnalysis.company.toString(),
    };

    console.log(
      `Using PDF secret authentication for user: ${callAnalysis.user}`,
    );

    await page.setExtraHTTPHeaders(headers);

    console.log(`Navigating to: ${printPageUrl}`);

    // Navigate to the frontend print page
    await page.goto(printPageUrl, {
      waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      timeout: 30000,
    });

    // Wait for content to be fully rendered
    await page.waitForFunction(
      `() => {
        // Wait for any meaningful content to be loaded
        const body = document.body;
        return body && body.textContent && body.textContent.trim().length > 100;
      }`,
      { timeout: 30000 },
    );

    // Additional wait to ensure all content is rendered
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Debug: Check if we're on the correct page
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`Current page URL: ${currentUrl}`);
    console.log(`Page title: ${pageTitle}`);

    // Check if we're redirected to login/home page or auth page
    if (
      currentUrl.includes('/login') ||
      currentUrl.includes('/auth') ||
      currentUrl === frontendUrl + '/' ||
      pageTitle.includes('Sign in') ||
      pageTitle.includes('Login') ||
      pageTitle.includes('Hupo Sales AI | Login')
    ) {
      console.error('Authentication failed - redirected to login/auth page');
      console.error(`Expected URL: ${printPageUrl}`);
      console.error(`Actual URL: ${currentUrl}`);
      throw new Error(
        'Authentication failed - unable to access assessment page.',
      );
    }

    // Generate PDF
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '10px',
        left: '0px',
      },
    });

    await browser.close();

    console.log(`PDF generated successfully for analysis: ${analysisId}`);

    return Buffer.from(pdfData);
  } catch (error) {
    // Ensure browser is closed on error
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    throw error;
  }
}
