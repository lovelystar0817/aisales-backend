import { FlattenMaps, Types } from 'mongoose';
import {
  HUPO_DEMO_SALES_MODULES,
  ALL_SALES_MODULES,
  BBL_SALES_MODULES,
  HSBC_SALES_MODULES,
  HSBC_YUE_SALES_MODULES,
  DEFAULT_SALES_MODULES,
  GRAB_SALES_MODULES,
  MANULIFE_SALES_MODULES,
  MODULE_GROUPS,
  MSIG_SALES_MODULES,
  PLT_SALES_MODULES,
  PRUDENTIAL_ID_SALES_MODULES,
  PRUDENTIAL_SALES_MODULES,
  RESEARCH_SALES_MODULES,
  MTL_SALES_MODULES,
  AXA_PH_SALES_MODULES,
  KT_AXA_SALES_MODULES,
  PRUDENTIAL_TW_SALES_MODULES,
  AIA_KO_SALES_MODULES,
  ALIBABA_SALES_MODULES,
  PRUDENTIAL_PH_SALES_MODULES,
  GREAT_EASTERN_SALES_MODULES,
  SCB_DEMO_SALES_MODULES,
  LALAMOVE_SALES_MODULES,
} from '../constants/modules.js';
import { loadTranslations } from '../locale/translation.js';
import { IModule, ModuleDocument } from '../models/Module.js';
import {
  HUPO_DEMO_COMPANY_ID,
  GRAB_COMPANY_ID,
  MSIG_COMPANY_ID,
  GRAB_LMS_COMPANY_ID,
  PRUDENTIAL_COMPANY_ID,
  PRUDENTIAL_ID_COMPANY_ID,
  RESEARCH_COMPANY_ID,
  MANULIFE_COMPANY_ID,
  PLT_COMPANY_ID,
  BBL_COMPANY_ID,
  HSBC_COMPANY_ID,
  HSBC_YUE_COMPANY_ID,
  MTL_COMPANY_ID,
  AXA_PH_COMPANY_ID,
  GRAB_TEST_COMPANY_ID,
  PRUDENTIAL_TW_COMPANY_ID,
  KT_AXA_COMPANY_ID,
  AIA_KO_COMPANY_ID,
  ALIBABA_COMPANY_ID,
  PRUDENTIAL_PH_COMPANY_ID,
  GREAT_EASTERN_COMPANY_ID,
  SCB_DEMO_COMPANY_ID,
  LALAMOVE_COMPANY_ID,
} from './constants.js';
import { getProductsForModule } from './product.js';
import { Scenario, ScenarioDocument } from '../models/Scenario.js';
import { ISalesProduct } from '../models/SalesProduct.js';

export const getModules = (
  companyId: string | undefined,
  languageCode: string = 'en',
): IModule[] => {
  // First check for database modules
  let result: IModule[] = [];
  switch (companyId) {
    case HUPO_DEMO_COMPANY_ID:
      result = HUPO_DEMO_SALES_MODULES;
      break;
    case PRUDENTIAL_COMPANY_ID:
      result = PRUDENTIAL_SALES_MODULES;
      break;
    case PRUDENTIAL_TW_COMPANY_ID:
      result = PRUDENTIAL_TW_SALES_MODULES;
      break;
    case PLT_COMPANY_ID:
      result = PLT_SALES_MODULES;
      break;
    case PRUDENTIAL_ID_COMPANY_ID:
      result = PRUDENTIAL_ID_SALES_MODULES;
      break;
    case GRAB_COMPANY_ID:
    case GRAB_LMS_COMPANY_ID:
    case GRAB_TEST_COMPANY_ID:
      result = GRAB_SALES_MODULES;
      break;
    case RESEARCH_COMPANY_ID:
      result = RESEARCH_SALES_MODULES;
      break;
    case MSIG_COMPANY_ID:
      result = MSIG_SALES_MODULES;
      break;
    case MANULIFE_COMPANY_ID:
      result = MANULIFE_SALES_MODULES;
      break;
    case BBL_COMPANY_ID:
      result = BBL_SALES_MODULES;
      break;
    case HSBC_COMPANY_ID:
      result = HSBC_SALES_MODULES;
      break;
    case HSBC_YUE_COMPANY_ID:
      result = HSBC_YUE_SALES_MODULES;
      break;
    case MTL_COMPANY_ID:
      result = MTL_SALES_MODULES;
      break;
    case AXA_PH_COMPANY_ID:
      result = AXA_PH_SALES_MODULES;
      break;
    case KT_AXA_COMPANY_ID:
      result = KT_AXA_SALES_MODULES;
      break;
    case AIA_KO_COMPANY_ID:
      result = AIA_KO_SALES_MODULES;
      break;
    case ALIBABA_COMPANY_ID:
      result = ALIBABA_SALES_MODULES;
      break;
    case PRUDENTIAL_PH_COMPANY_ID:
      result = PRUDENTIAL_PH_SALES_MODULES;
      break;
    case GREAT_EASTERN_COMPANY_ID:
      result = GREAT_EASTERN_SALES_MODULES;
      break;
    case SCB_DEMO_COMPANY_ID:
      result = SCB_DEMO_SALES_MODULES;
      break;
    case LALAMOVE_COMPANY_ID:
      result = LALAMOVE_SALES_MODULES;
      break;
    default:
      result = DEFAULT_SALES_MODULES;
      break;
  }

  // Apply translations and populate products
  const localizedModules = localizeModules(result, languageCode);
  return populateModulesWithProducts(localizedModules, companyId, languageCode);
};

/**
 * Populate modules with their associated products (like mongoose populate)
 */
const populateModulesWithProducts = (
  modules: IModule[],
  companyId: string | undefined,
  languageCode: string = 'en',
): IModule[] => {
  const populatedModules = modules.map((module) => {
    const products = getProductsForModule(
      companyId,
      module.friendlyId,
      languageCode,
    );
    return {
      ...module,
      products,
    } as unknown as IModule;
  });

  return populatedModules;
};

/**
 * Apply localization to an array of modules
 * @param modules Array of module documents to localize
 * @param languageCode Target language code
 * @returns Array of localized module documents
 */
const localizeModules = (
  modules: IModule[],
  languageCode: string,
): IModule[] => {
  // Load translations for the target language
  const translations = loadTranslations(languageCode);
  if (!translations || !translations.modules) {
    return modules; // Return original if no translations available
  }

  // Apply translations to each module
  return modules.map((module) => {
    // Create a copy of the module to modify
    const localizedModule = { ...module };

    // Get module translations from i18n JSON files
    const moduleTranslations = translations.modules.items?.[module.friendlyId];

    // Apply translations for title, description, and initialMessage if available
    if (moduleTranslations) {
      if (moduleTranslations.title) {
        localizedModule.title = moduleTranslations.title;
      }

      if (moduleTranslations.description) {
        localizedModule.description = moduleTranslations.description;
      }

      // Add objectives translation
      if (
        moduleTranslations.objectives &&
        Array.isArray(moduleTranslations.objectives)
      ) {
        localizedModule.objectives = moduleTranslations.objectives;
      }
    } else if (languageCode !== 'en' && module.localizations?.[languageCode]) {
      // Fallback to co-located localizations on the module object
      const loc = module.localizations[languageCode];
      if (loc.title) localizedModule.title = loc.title;
      if (loc.description) localizedModule.description = loc.description;
      if (loc.objectives && Array.isArray(loc.objectives)) {
        localizedModule.objectives = loc.objectives;
      }
      if (loc.scenarioSetup) {
        localizedModule.scenarioSetup = loc.scenarioSetup;
      }
    }

    // Translate the group name if it exists
    if (localizedModule.group && translations.modules.groups) {
      // Extract the group key from the group name
      const groupKey = Object.entries(MODULE_GROUPS)
        .find(([_, value]) => value === localizedModule.group)?.[0]
        ?.toLowerCase();

      // If we found a matching group key and a translation exists, use it
      if (groupKey && translations.modules.groups[groupKey]) {
        localizedModule.group = translations.modules.groups[groupKey];
      }
    }

    return localizedModule;
  });
};

export const getModuleById = (
  moduleId: string,
  languageCode: string = 'en',
): IModule | null => {
  const module = ALL_SALES_MODULES.find((m) => m._id?.toString() === moduleId);
  if (!module) {
    return null;
  }

  return localizeModules([module], languageCode)[0];
};

export const getModuleByFriendlyId = (
  moduleId?: string,
  languageCode: string = 'en',
): IModule | null => {
  const module = ALL_SALES_MODULES.find((m) => m.friendlyId === moduleId);
  if (!module) {
    return null;
  }

  // Get the module or use default sales
  const result = module;

  // Return the localized version of the module
  return localizeModules([result], languageCode)[0];
};

/**
 * Get modules for a company
 * @param companyId - The company ID
 * @param languageCode - The language code
 * @returns An array of modules with products
 */
export async function getModulesV2(companyId: string, languageCode: string) {
  const customScenarios = await Scenario.find({
    company: new Types.ObjectId(companyId),
    isActive: true,
  })
    .populate<{ module: IModule }>({
      path: 'module',
    })
    .populate<{ product: ISalesProduct }>({
      path: 'product',
    })
    .lean();

  return transformScenariosToModules(customScenarios, languageCode);
}

/**
 * Get modules that have only inactive scenarios but have been used in past sessions
 * This helps show historical modules that users have practiced before
 * @param companyId - The company ID
 * @param languageCode - The language code
 * @returns An array of modules with products (same format as getModulesV2)
 */
export async function getInactiveModulesWithHistory(
  companyId: string,
  languageCode: string,
) {
  // Import dependencies dynamically to avoid circular dependency
  const { SalesSession } = await import('../models/SalesSession.js');
  const { User } = await import('../models/User.js');
  const { buildBaseUserFilter } = await import('./manage/shared.js');

  // Get user IDs for this company using the shared filter logic
  const userFilter = buildBaseUserFilter(companyId);
  const userIds = await User.find(userFilter).distinct('_id');

  // If no users found, return empty array
  if (!userIds || userIds.length === 0) {
    return [];
  }

  // Get distinct scenario IDs that have been used in sessions by users in this company
  const usedScenarioIds = await SalesSession.distinct('scenario', {
    user: { $in: userIds },
    scenario: { $exists: true, $ne: null },
  });

  // If no scenarios have been used, return empty array
  if (!usedScenarioIds || usedScenarioIds.length === 0) {
    return [];
  }

  // Query inactive scenarios that have been used in sessions
  const inactiveUsedScenarios = await Scenario.find({
    company: new Types.ObjectId(companyId),
    isActive: false,
    _id: { $in: usedScenarioIds },
  })
    .populate<{ module: IModule }>({
      path: 'module',
    })
    .populate<{ product: ISalesProduct }>({
      path: 'product',
    })
    .lean();

  return transformScenariosToModules(inactiveUsedScenarios, languageCode);
}

type InputScenario = Omit<
  FlattenMaps<ScenarioDocument>,
  'module' | 'product'
> & {
  module: IModule;
  product: ISalesProduct;
};
type ModuleDetailsWithProductMap = Omit<IModule, 'products'> & {
  products: Map<string, ISalesProduct>;
};
type ModuleDetailsWithProductArray = Omit<IModule, 'products'> & {
  products: ISalesProduct[];
};

function transformScenariosToModules(
  scenarios: InputScenario[],
  languageCode: string,
): ModuleDetailsWithProductArray[] {
  const modules = new Map<string, ModuleDetailsWithProductMap>();

  for (const sc of scenarios) {
    let module = { ...sc.module, scenarioId: sc._id };
    let product = { ...sc.product, scenarioId: sc._id };

    if (!product) {
      continue;
    }
    const moduleId = module.friendlyId;

    if (languageCode !== 'en' && languageCode in (module.localizations ?? {})) {
      const { _id: moduleLocId, ...moduleLocWithoutId } =
        (module.localizations?.[languageCode] as any) || {};
      module = {
        ...module,
        ...moduleLocWithoutId,
      };

      const { _id: productLocId, ...productLocWithoutId } =
        (product.localizations?.[languageCode] as any) || {};
      product = {
        ...product,
        ...productLocWithoutId,
      };
    }

    if (!modules.has(moduleId)) {
      modules.set(moduleId, {
        ...module,
        products: new Map<string, ISalesProduct>(),
      });
    }

    const existingModule = modules.get(moduleId)!;
    existingModule.products.set(product.friendlyId, product);

    modules.set(moduleId, existingModule);
  }

  return Array.from(modules.values()).map((module) => ({
    ...module,
    products: Array.from(module.products.values()),
  }));
}

export const getLocalizedModuleFromScenario = (
  scenario?: Omit<ScenarioDocument, 'module'> & {
    module: ModuleDocument;
  },
  languageCode: string = 'en',
): IModule | null => {
  if (!scenario) {
    return null;
  }

  return scenario.module
    ? {
        ...scenario.module,
        ...(scenario.module.localizations?.[languageCode]
          ? {
              ...scenario.module.localizations[languageCode],
            }
          : {}),
      }
    : null;
};
