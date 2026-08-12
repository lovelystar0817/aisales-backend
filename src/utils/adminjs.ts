import type { ResourceWithOptions } from 'adminjs';
import AdminJS from 'adminjs';
import { AllowlistManageUser } from '../models/AllowlistManageUser.js';
import { CallAnalysis } from '../models/CallAnalysis.js';
import { Company } from '../models/Company.js';
import { DashboardCache } from '../models/DashboardCache.js';
import { ManageUser } from '../models/ManageUser.js';
import { Message } from '../models/Message.js';
import { Module } from '../models/Module.js';
import { Persona } from '../models/Persona.js';
import { SalesProduct } from '../models/SalesProduct.js';
import { SalesProductCompetitor } from '../models/SalesProductCompetitor.js';
import { SalesSession } from '../models/SalesSession.js';
import { Scenario } from '../models/Scenario.js';
import { Team } from '../models/Team.js';
import { User } from '../models/User.js';
import { UserStanding } from '../models/UserStanding.js';
import { Scorecard } from '../models/Scorecard.js';
import { Voice } from '../models/Voice.js';
import { AdminLog } from '../models/AdminLog.js';

const NAV_GROUPS = {
  USERS: {
    name: 'Everything',
    icon: 'User',
  },

  SESSION: {
    name: 'Sessions',
    icon: 'Calendar',
  },

  SCENARIO_CONFIG: {
    name: 'Scenario Config',
    icon: 'Settings',
  },

  AUDIT: {
    name: 'Audit',
    icon: 'FileText',
  },
} as const;

const resources: Array<ResourceWithOptions> = [
  {
    resource: User,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: Company,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: ManageUser,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: Team,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },
  {
    resource: AllowlistManageUser,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },
  {
    resource: UserStanding,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },
  {
    resource: CallAnalysis,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },
  {
    resource: DashboardCache,
    options: {
      navigation: NAV_GROUPS.USERS,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: SalesSession,
    options: {
      navigation: NAV_GROUPS.SESSION,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: Message,
    options: {
      navigation: NAV_GROUPS.SESSION,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: Scenario,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
      listProperties: [
        '_id',
        'module',
        'persona',
        'scorecard',
        'product',
        'company',
        'isActive',
        'updatedAt',
      ],
      filterProperties: [
        'module',
        'persona',
        'scorecard',
        'product',
        'company',
        'isActive',
      ],
      editProperties: [
        'module',
        'persona',
        'scorecard',
        'product',
        'company',
        'difficultyLevel',
        'isActive',
        'contextPrompt',
        'voicePrompt',
        'updatedBy',
      ],
      showProperties: [
        '_id',
        'module',
        'persona',
        'scorecard',
        'product',
        'company',
        'difficultyLevel',
        'isActive',
        'contextPrompt',
        'voicePrompt',
        'updatedBy',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        localizations: {
          isVisible: false,
        },
      },
    },
  },

  {
    resource: Persona,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: Module,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
      listProperties: [
        '_id',
        'friendlyId',
        'title',
        'description',
        'group',
        'company',
        'updatedAt',
      ],
      filterProperties: ['friendlyId', 'title', 'group', 'company'],
      editProperties: [
        'friendlyId',
        'title',
        'description',
        'icon',
        'iconBgColor',
        'group',
        'scenarioSetup',
        'objectives',
        'company',
      ],
      showProperties: [
        '_id',
        'friendlyId',
        'title',
        'description',
        'icon',
        'iconBgColor',
        'group',
        'scenarioSetup',
        'objectives',
        'company',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        localizations: {
          isVisible: false,
        },
      },
    },
  },

  {
    resource: SalesProduct,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
      // Explicitly define which properties to show to prevent auto-detection of nested Map fields
      listProperties: [
        '_id',
        'friendlyId',
        'name',
        'productType',
        'salesTarget',
        'company',
        'updatedAt',
      ],
      filterProperties: [
        'friendlyId',
        'name',
        'productType',
        'salesTarget',
        'company',
      ],
      editProperties: [
        'friendlyId',
        'name',
        'knowledgePrompt',
        'productType',
        'keyFeatures',
        'evaluationFocus',
        'salesTarget',
        'company',
        'createdBy',
        'updatedBy',
        'documentCount',
        'roleplayCount',
        'hasCompetitiveIntelligence',
        'isPlaceholderProduct',
      ],
      showProperties: [
        '_id',
        'friendlyId',
        'name',
        'knowledgePrompt',
        'productType',
        'keyFeatures',
        'evaluationFocus',
        'salesTarget',
        'company',
        'createdBy',
        'updatedBy',
        'documentCount',
        'roleplayCount',
        'hasCompetitiveIntelligence',
        'isPlaceholderProduct',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        // Completely hide localizations to avoid regex errors with nested Map fields
        localizations: {
          isVisible: false,
        },
      },
    },
  },
  {
    resource: SalesProductCompetitor,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
      listProperties: ['_id', 'product', 'company', 'source', 'updatedAt'],
      filterProperties: ['product', 'company', 'source'],
      editProperties: ['product', 'company', 'competitors', 'source'],
      showProperties: [
        '_id',
        'product',
        'company',
        'competitors',
        'source',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        localizations: {
          isVisible: false,
          type: 'mixed',
        },
      },
    },
  },
  {
    resource: Scorecard,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
      listProperties: [
        '_id',
        'friendlyId',
        'name',
        'assessmentType',
        'company',
        'updatedAt',
      ],
      filterProperties: ['friendlyId', 'name', 'assessmentType', 'company'],
      editProperties: [
        'friendlyId',
        'name',
        'assessmentType',
        'company',
        'createdBy',
        'updatedBy',
      ],
      showProperties: [
        '_id',
        'friendlyId',
        'name',
        'assessmentType',
        'company',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
      ],
      properties: {
        localizations: {
          isVisible: false,
        },
      },
    },
  },
  {
    resource: Voice,
    options: {
      navigation: NAV_GROUPS.SCENARIO_CONFIG,
      sort: {
        direction: 'desc',
        sortBy: 'updatedAt',
      },
    },
  },

  {
    resource: AdminLog,
    options: {
      navigation: NAV_GROUPS.AUDIT,
      sort: {
        direction: 'desc',
        sortBy: 'createdAt',
      },
      actions: {
        new: { isAccessible: false },
        edit: { isAccessible: false },
        delete: { isAccessible: false },
        bulkDelete: { isAccessible: false },
      },
      listProperties: [
        'adminEmail',
        'action',
        'category',
        'targetName',
        'createdAt',
      ],
      filterProperties: [
        'adminEmail',
        'action',
        'category',
        'company',
        'createdAt',
      ],
      showProperties: [
        'adminUser',
        'adminEmail',
        'company',
        'action',
        'category',
        'targetType',
        'targetId',
        'targetName',
        'details',
        'ipAddress',
        'userAgent',
        'createdAt',
      ],
    },
  },
];

export const admin = new AdminJS({
  databases: [],
  rootPath: '/admin',
  resources,
});
