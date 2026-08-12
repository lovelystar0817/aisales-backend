import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../../env.js';
import { connect, disconnect, Types } from 'mongoose';
import { SalesProduct } from '../../models/SalesProduct.js';
import { SalesProductCompetitor } from '../../models/SalesProductCompetitor.js';
import {
  GRAB_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
} from '../../utils/constants.js';
import { grabCompetitiveIntelligenceConfiguration as GRAB_CI } from '../../competitive-intelligence/configs/index.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

// Parse company argument
const VALID_COMPANIES = ['grab', 'grab-test'] as const;
type CompanyArg = (typeof VALID_COMPANIES)[number];

function parseCompanyArg(): CompanyArg {
  const companyArg = process.argv.find((arg) => arg.startsWith('--company='));

  if (!companyArg) {
    console.error('Error: --company argument is required');
    console.error('Usage: npx tsx script.ts --company=grab|grab-test');
    process.exit(1);
  }

  const value = companyArg.split('=')[1] as CompanyArg;

  if (!VALID_COMPANIES.includes(value)) {
    console.error(
      `Error: Invalid company "${value}". Must be one of: ${VALID_COMPANIES.join(', ')}`,
    );
    process.exit(1);
  }

  return value;
}

const companyArg = parseCompanyArg();
const TARGET_COMPANY_ID =
  companyArg === 'grab' ? GRAB_COMPANY_ID : GRAB_TEST_COMPANY_ID;

function buildLocalizationMap(ci: any) {
  const localizations: Record<string, any> = {};
  for (const lang of Object.keys(ci.localized || {})) {
    if (lang === 'en') continue;
    const data = ci.localized[lang];
    if (data?.competitors?.length) {
      localizations[lang] = { competitors: data.competitors };
    }
  }
  return localizations;
}

export async function seedGrabSalesProductCompetitors() {
  await connect(process.env.DATABASE_URL!);

  try {
    const companyId = new Types.ObjectId(TARGET_COMPANY_ID);

    // Get all Grab products
    const grabProducts = await SalesProduct.find({ company: companyId })
      .select('_id friendlyId')
      .lean();

    if (!grabProducts.length) {
      console.log('No Grab products found.');
      return;
    }

    // Create a map of products by friendlyId (strip the nanoid suffix)
    const grabProductsByBaseFriendlyId = new Map<string, any[]>();
    for (const product of grabProducts) {
      // friendlyId format: "grab-for-business-abc123" -> base: "grab-for-business"
      const baseFriendlyId = (product.friendlyId as string)
        .split('-')
        .slice(0, -1)
        .join('-');

      if (!grabProductsByBaseFriendlyId.has(baseFriendlyId)) {
        grabProductsByBaseFriendlyId.set(baseFriendlyId, []);
      }
      grabProductsByBaseFriendlyId.get(baseFriendlyId)!.push(product);
    }

    // Get existing competitor records
    const productIds = grabProducts.map((p) => p._id);
    const existingCompetitors = await SalesProductCompetitor.find({
      product: { $in: productIds },
      company: companyId,
    })
      .select('product')
      .lean();

    const existingProductIds = new Set(
      existingCompetitors.map((c) => c?.product?.toString()),
    );

    const operations: any[] = [];
    const productsConfig = GRAB_CI.products || {};

    for (const [baseFriendlyId, ci] of Object.entries(productsConfig)) {
      const products = grabProductsByBaseFriendlyId.get(baseFriendlyId);
      if (!products?.length) {
        console.warn(
          `Grab CI: No products found for baseFriendlyId=${baseFriendlyId}, skipping`,
        );
        continue;
      }

      const en = (ci as any).localized?.en;
      if (!en?.competitors?.length) {
        console.log(
          `Grab CI: No competitors configured for ${baseFriendlyId}, skipping`,
        );
        continue;
      }

      const localizations = buildLocalizationMap(ci);

      for (const product of products) {
        // Skip if already has competitor info
        if (existingProductIds.has(product._id.toString())) {
          console.log(
            `Grab CI: Product ${product.friendlyId} already has competitor info, skipping`,
          );
          continue;
        }

        operations.push({
          insertOne: {
            document: {
              product: product._id,
              company: companyId,
              competitors: en.competitors,
              localizations,
            },
          },
        });
      }
    }

    if (operations.length > 0) {
      const result = await SalesProductCompetitor.bulkWrite(operations, {
        ordered: false,
      });
      console.log('Grab SalesProductCompetitor seeding completed:', {
        company: companyArg,
        companyId: TARGET_COMPANY_ID,
        inserted: result.insertedCount,
      });
    } else {
      console.log('No Grab SalesProductCompetitor operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding Grab SalesProductCompetitors:', error);
  } finally {
    await disconnect();
  }
}

void seedGrabSalesProductCompetitors();
