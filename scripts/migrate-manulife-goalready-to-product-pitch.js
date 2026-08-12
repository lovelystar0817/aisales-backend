/**
 * Migration script: Update manulife-goalready module to manulife-product-pitch
 *
 * This script updates the module definition in the database to support multiple products:
 * - friendlyId: 'manulife-goalready' → 'manulife-product-pitch'
 * - title: 'GoalReady' → 'Product Pitch'
 * - singleScenario: true → false
 * - Updates descriptions and localizations to be product-agnostic
 *
 * IMPORTANT: This is an in-place update. Existing sessions will continue to work
 * because they reference assessmentType, not module friendlyId.
 *
 * Usage: node scripts/migrate-manulife-goalready-to-product-pitch.js [--dry-run]
 */

import { config } from 'dotenv';
import { connect, disconnect, Types } from 'mongoose';
import { Module } from '../dist/models/Module.js';

// Load environment variables
config({ path: '.env.local' });

const isDryRun = process.argv.includes('--dry-run');
const MODULE_ID = '671e60000000000000000012';

async function migrateModule() {
  try {
    console.log('🔌 Connecting to database...');
    await connect(process.env.DATABASE_URL);
    console.log('✅ Connected successfully\n');

    console.log(`📋 Fetching module with _id: ${MODULE_ID}...`);
    const module = await Module.findById(new Types.ObjectId(MODULE_ID));

    if (!module) {
      console.error(`❌ Error: Module with _id ${MODULE_ID} not found`);
      process.exit(1);
    }

    console.log('📄 CURRENT MODULE STATE:');
    console.log('------------------------');
    console.log(`friendlyId: ${module.friendlyId}`);
    console.log(`title: ${module.title}`);
    console.log(`singleScenario: ${module.singleScenario}`);
    console.log(`description: ${module.description}`);
    if (module.localizations?.tl) {
      console.log(`\nTagalog localization:`);
      console.log(`  title: ${module.localizations.tl.title}`);
      console.log(`  description: ${module.localizations.tl.description}`);
    }

    const updates = {
      friendlyId: 'manulife-product-pitch',
      title: 'Product Pitch',
      singleScenario: false,
      description: "Explore the client's financial goals and recommend suitable Manulife products as solutions to help them achieve their financial objectives.",
      'objectives.2': 'Present the product clearly and confidently',
      'localizations.tl.title': 'Product Pitch',
      'localizations.tl.description': 'Tuklasin ang mga layuning pinansyal ng kliyente at irekomenda ang angkop na mga produkto ng Manulife bilang mga solusyon upang makatulong sa kanila na makamit ang kanilang mga layuning pinansyal.',
      'localizations.tl.objectives.2': 'Ipresenta ang produkto nang malinaw at may kumpiyansa',
    };

    console.log('\n📝 PROPOSED CHANGES:');
    console.log('--------------------');
    console.log(`friendlyId: "${module.friendlyId}" → "${updates.friendlyId}"`);
    console.log(`title: "${module.title}" → "${updates.title}"`);
    console.log(`singleScenario: ${module.singleScenario} → ${updates.singleScenario}`);
    console.log(`description: "${module.description.substring(0, 60)}..." → "${updates.description.substring(0, 60)}..."`);
    console.log(`\nTagalog localization:`);
    console.log(`  title: "${module.localizations?.tl?.title}" → "${updates['localizations.tl.title']}"`);

    if (isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No changes will be made');
      console.log('Run without --dry-run flag to apply changes');
    } else {
      console.log('\n⚡ Applying updates...');
      await Module.updateOne(
        { _id: new Types.ObjectId(MODULE_ID) },
        { $set: updates }
      );

      // Verify update
      const updatedModule = await Module.findById(new Types.ObjectId(MODULE_ID));
      console.log('\n✅ MIGRATION COMPLETE!');
      console.log('----------------------');
      console.log(`friendlyId: ${updatedModule.friendlyId}`);
      console.log(`title: ${updatedModule.title}`);
      console.log(`singleScenario: ${updatedModule.singleScenario}`);
      console.log(`description: ${updatedModule.description.substring(0, 80)}...`);
    }

    console.log('\n📊 NEXT STEPS:');
    console.log('1. Verify /home endpoint returns module with GoalReady product');
    console.log('2. Create a new session with manulife-product-pitch module');
    console.log('3. Test scenario selection flow (should show GoalReady product)');
    console.log('4. Complete a session and verify assessment generation works');
    console.log('5. Check PDF report and dashboard display');
    console.log('6. Verify old sessions are still accessible');

    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await disconnect();
    process.exit(1);
  }
}

console.log('🚀 Manulife Module Migration Script');
console.log('====================================\n');
migrateModule();
