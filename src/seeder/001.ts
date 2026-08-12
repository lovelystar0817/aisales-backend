import { connect, disconnect, Types } from 'mongoose';
import {
  IModule,
  Module,
  ModuleLocalization,
  ModuleLocalizations,
} from '../models/Module.js';
import {
  DEFAULT_SALES_MODULES,
  GRAB_SALES_MODULES,
  MSIG_SALES_MODULES,
  PRUDENTIAL_SALES_MODULES,
  PRUDENTIAL_PH_SALES_MODULES,
  RESEARCH_SALES_MODULES,
  MTL_SALES_MODULES,
  AXA_PH_SALES_MODULES,
  GREAT_EASTERN_SALES_MODULES,
} from '../constants/modules.js';
import * as dotenv from 'dotenv';
import { getModuleByFriendlyId } from '../utils/module.js';
import {
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_PH_COMPANY_ID,
  RESEARCH_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
  SUPPORTED_LANGUAGES,
} from '../utils/constants.js';
import { envExtension } from '../env.js';
import { join } from 'node:path';

dotenv.config({ path: join(process.cwd(), envExtension()) });

const mapStaticModuleToDoc = (mod: IModule) => {
  const defaultLanguage = 'en';
  const languages = SUPPORTED_LANGUAGES;

  const shownFields: string[] = [...(mod.fields?.shown ?? [])];

  const defaultLocalization = getModuleByFriendlyId(
    mod.friendlyId,
    defaultLanguage,
  );
  const localizations: ModuleLocalizations = languages.reduce(
    (acc, lang) => {
      const langLocalization = getModuleByFriendlyId(mod.friendlyId, lang);
      acc[lang] = {
        title: langLocalization?.title,
        description: langLocalization?.description,
      };
      return acc;
    },
    {} as Record<(typeof languages)[number], ModuleLocalization>,
  );

  return {
    _id: new Types.ObjectId(),
    title: mod.title,
    description: mod.description,
    friendlyId: mod.friendlyId,
    icon: mod.icon,
    iconBgColor: mod.iconBgColor,
    group: mod.group,
    fields: {
      shown: shownFields,
      hidden: [],
    },
    localizations: {
      [defaultLanguage]: {
        title: defaultLocalization?.title,
        description: defaultLocalization?.description,
      },
      ...localizations,
    },
  };
};

// seed modules with localizations
export async function seedModules() {
  await connect(process.env.DATABASE_URL!);

  const modulesToBeInserted: IModule[] = [
    ...DEFAULT_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: undefined,
    })),
    ...PRUDENTIAL_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(PRUDENTIAL_COMPANY_ID),
    })),
    ...GRAB_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(GRAB_COMPANY_ID),
    })),
    ...RESEARCH_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(RESEARCH_COMPANY_ID),
    })),
    ...MSIG_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(MSIG_COMPANY_ID),
    })),
    ...MTL_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(MTL_COMPANY_ID),
    })),
    ...AXA_PH_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(AXA_PH_COMPANY_ID),
    })),
    ...PRUDENTIAL_PH_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(PRUDENTIAL_PH_COMPANY_ID),
    })),
    ...GREAT_EASTERN_SALES_MODULES.map((mod) => ({
      ...mapStaticModuleToDoc(mod),
      company: new Types.ObjectId(GREAT_EASTERN_COMPANY_ID),
    })),
  ];

  await Module.insertMany(modulesToBeInserted);
  await disconnect();
}

void seedModules();
