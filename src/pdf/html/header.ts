import fs from 'fs/promises';
import { Buffer } from 'buffer';
import path from 'path';
import { fileURLToPath } from 'url';

async function imageFileToBase64(fileName: string): Promise<string> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.resolve(process.cwd(), 'public/logos', fileName);
  console.log('Logo file path:', filePath);
  try {
    const imageBuffer = await fs.readFile(filePath);
    const extension = path.extname(fileName).toLowerCase();

    let mimeType: string;
    switch (extension) {
      case '.png':
        mimeType = 'image/png';
        break;
      case '.svg':
        mimeType = 'image/svg+xml';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      default:
        mimeType = 'image/png'; // fallback
    }

    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (err) {
    console.error('Failed to read image file:', err);
    return '';
  }
}

async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine content type from URL or default to PNG
    let contentType = response.headers.get('content-type');
    if (!contentType || contentType === 'application/octet-stream') {
      if (url.toLowerCase().includes('.png')) {
        contentType = 'image/png';
      } else if (
        url.toLowerCase().includes('.jpg') ||
        url.toLowerCase().includes('.jpeg')
      ) {
        contentType = 'image/jpeg';
      } else if (url.toLowerCase().includes('.svg')) {
        contentType = 'image/svg+xml';
      } else {
        contentType = 'image/png'; // default
      }
    }

    console.log('URL content-type:', contentType);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.error('Failed to fetch URL image:', err);
    return '';
  }
}

interface CompanyLogoConfig {
  imageUrl: string;
  height: string;
}

interface HeaderTranslations {
  title: string;
  completedOn: string;
  hupoLogoAlt: string;
  companyLogoAlt: string;
}

export async function generateHeaderHtml(
  userEmail: string,
  completedAt: string,
  company: CompanyLogoConfig,
  translations: HeaderTranslations,
): Promise<string> {
  const hupoIcon = await imageFileToBase64('hupoLogo.png');

  console.log('Company config:', company);

  // Get company logo from URL
  let companyIcon: string;
  if (company.imageUrl) {
    console.log('Fetching company logo from URL:', company.imageUrl);
    companyIcon = await urlToBase64(company.imageUrl);
  } else {
    console.log('No company image URL provided, using default');
    companyIcon = hupoIcon; // fallback to hupo logo
  }

  console.log(
    'Company icon result (first 100 chars):',
    companyIcon.substring(0, 100),
  );

  const logoHeight = company.height || '30px';

  const headerTemplate = `
    <div style="
        width: 100%;
        height: 100px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
        padding: 24px;
        margin-top: -20px;
        background-color: #EFEFEF;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    ">
        <div style="display: flex; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <img
                    src="${hupoIcon}"
                    alt="${translations.hupoLogoAlt}"
                    style="height: 20px; width: auto; vertical-align: middle;"
                />
                <img
                    src="${companyIcon}"
                    alt="${translations.companyLogoAlt}"
                    style="height: ${logoHeight}; width: auto; vertical-align: middle;"
                />
            </div>
        </div>
    
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 20px; font-weight: bold;">${translations.title}</div>
            <div style="display: flex; flex-direction: column; text-align: right;">
                <div style="font-size: 14px; font-weight: bold;">${userEmail}</div>
                <div style="font-size: 14px;">${translations.completedOn} ${completedAt}</div>
            </div>
        </div>
    </div>
    `;

  return headerTemplate;
}
