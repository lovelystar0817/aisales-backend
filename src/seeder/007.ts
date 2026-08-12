import * as dotenv from 'dotenv';
import { join } from 'node:path';
import { envExtension } from '../env.js';
import { connect, disconnect, Types } from 'mongoose';
import { SalesProduct } from '../models/SalesProduct.js';
import { SalesProductCompetitor } from '../models/SalesProductCompetitor.js';
import { defaultCompetitiveIntelligenceConfiguration as DEFAULT_CI } from '../competitive-intelligence/default.js';
import { prudentialCompetitiveIntelligenceConfiguration as PRU_CI } from '../competitive-intelligence/prudential.js';
import { grabCompetitiveIntelligenceConfiguration as GRAB_CI } from '../competitive-intelligence/grab.js';
import { msigCompetitiveIntelligenceConfiguration as MSIG_CI } from '../competitive-intelligence/msig.js';
import {
  PRUDENTIAL_COMPANY_ID,
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
} from '../utils/constants.js';

dotenv.config({ path: join(process.cwd(), envExtension()) });

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

export async function seedSalesProductCompetitors() {
  await connect(process.env.DATABASE_URL!);

  try {
    const operations: any[] = [];

    // 1) DEFAULT (no company) → apply to all default/global products
    {
      const defaultProducts = await SalesProduct.find({
        $or: [{ company: { $exists: false } }, { company: null }],
      })
        .select('_id friendlyId company')
        .lean();

      const en = DEFAULT_CI.localized?.en;
      if (en?.competitors?.length) {
        const localizations = buildLocalizationMap(DEFAULT_CI);
        for (const product of defaultProducts) {
          operations.push({
            updateOne: {
              filter: {
                product: product._id,
                $or: [{ company: { $exists: false } }, { company: null }],
              },
              update: {
                $setOnInsert: {
                  product: product._id,
                },
                $set: {
                  competitors: en.competitors,
                  localizations,
                },
              },
              upsert: true,
            },
          });
        }
      }
    }

    // 2) PRUDENTIAL → product-specific CI per product friendlyId
    {
      const companyId = new Types.ObjectId(PRUDENTIAL_COMPANY_ID);
      const pruProducts = await SalesProduct.find({ company: companyId })
        .select('_id friendlyId')
        .lean();

      const pruProductsByFriendly = new Map(
        pruProducts.map((p: any) => [p.friendlyId as string, p]),
      );

      const productsConfig = PRU_CI.products || {};
      for (const [friendlyId, ci] of Object.entries(productsConfig)) {
        const product = pruProductsByFriendly.get(friendlyId);
        if (!product) {
          console.warn(
            `PRU CI: Product not found for friendlyId=${friendlyId}, skipping`,
          );
          continue;
        }

        const en = (ci as any).localized?.en;
        if (!en?.competitors?.length) continue;
        const localizations = buildLocalizationMap(ci);

        operations.push({
          updateOne: {
            filter: { product: product._id, company: companyId },
            update: {
              $setOnInsert: {
                product: product._id,
                company: companyId,
              },
              $set: {
                competitors: en.competitors,
                localizations,
              },
            },
            upsert: true,
          },
        });
      }
    }

    // 3) GRAB → apply company-level CI to all Grab products
    {
      const companyId = new Types.ObjectId(GRAB_COMPANY_ID);
      const grabProducts = await SalesProduct.find({ company: companyId })
        .select('_id friendlyId')
        .lean();

      const en = GRAB_CI.localized?.en;
      if (grabProducts.length && en?.competitors?.length) {
        const localizations = buildLocalizationMap(GRAB_CI);
        for (const product of grabProducts) {
          operations.push({
            updateOne: {
              filter: { product: product._id, company: companyId },
              update: {
                $setOnInsert: {
                  product: product._id,
                  company: companyId,
                },
                $set: {
                  competitors: en.competitors,
                  localizations,
                },
              },
              upsert: true,
            },
          });
        }
      }
    }

    // 4) MSIG → product-specific CI per product friendlyId
    {
      const companyId = new Types.ObjectId(MSIG_COMPANY_ID);
      const msigProducts = await SalesProduct.find({ company: companyId })
        .select('_id friendlyId')
        .lean();

      const msigProductsByFriendly = new Map(
        msigProducts.map((p: any) => [p.friendlyId as string, p]),
      );

      const productsConfig = MSIG_CI.products || {};
      for (const [friendlyId, ci] of Object.entries(productsConfig)) {
        const product = msigProductsByFriendly.get(friendlyId);
        if (!product) {
          console.warn(
            `MSIG CI: Product not found for friendlyId=${friendlyId}, skipping`,
          );
          continue;
        }

        const en = (ci as any).localized?.en;
        if (!en?.competitors?.length) continue;
        const localizations = buildLocalizationMap(ci);

        operations.push({
          updateOne: {
            filter: { product: product._id, company: companyId },
            update: {
              $setOnInsert: {
                product: product._id,
                company: companyId,
              },
              $set: {
                competitors: en.competitors,
                localizations,
              },
            },
            upsert: true,
          },
        });
      }
    }

    if (operations.length > 0) {
      const result = await SalesProductCompetitor.bulkWrite(operations, {
        ordered: false,
      });
      console.log('SalesProductCompetitor seeding completed:', {
        upserted: result.upsertedCount,
        modified: result.modifiedCount,
        matched: result.matchedCount,
      });
    } else {
      console.log('No SalesProductCompetitor operations to execute.');
    }
  } catch (error) {
    console.error('Error seeding SalesProductCompetitor:', error);
  } finally {
    await disconnect();
  }
}

void seedSalesProductCompetitors();
