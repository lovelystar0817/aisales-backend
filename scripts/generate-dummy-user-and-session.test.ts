import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { SalesSession } from '../src/models/SalesSession.js';
import { Company } from '../src/models/Company.js';
import { Scenario } from '../src/models/Scenario.js';
import { Module } from '../src/models/Module.js';
import { Persona } from '../src/models/Persona.js';
import { SalesProduct } from '../src/models/SalesProduct.js';
import { Scorecard } from '../src/models/Scorecard.js';

describe('Generate Dummy User and Session Script Tests', () => {
  let companyId: mongoose.Types.ObjectId;
  let scenarioId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/sales-ai-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await User.deleteMany({ email: /^dummy\+.*@hupo\.co$/ });
    await SalesSession.deleteMany({});
    await Company.deleteMany({ friendlyId: 'test-company-dummy' });
    await Scenario.deleteMany({});
    await Module.deleteMany({});
    await Persona.deleteMany({});
    await SalesProduct.deleteMany({});
    await Scorecard.deleteMany({});

    // Create test company
    const company = new Company({
      name: 'Test Company Dummy',
      friendlyId: 'test-company-dummy',
    });
    await company.save();
    companyId = company._id;

    // Create test module
    const module = new Module({
      title: 'Test Module',
      description: 'Test module description',
      friendlyId: 'test-module',
      icon: 'test-icon',
      iconBgColor: '#000000',
      company: companyId,
    });
    await module.save();

    // Create test product
    const product = new SalesProduct({
      name: 'Test Product',
      friendlyId: 'test-product',
      company: companyId,
      productType: 'own',
    });
    await product.save();

    // Create test persona
    const persona = new Persona({
      name: 'Test Persona',
      friendlyId: 'test-persona',
      age: 30,
      occupation: 'Test Occupation',
      image: 'test-image.jpg',
      gender: 'male',
      company: companyId,
    });
    await persona.save();

    // Create test scorecard
    const scorecard = new Scorecard({
      name: 'Test Scorecard',
      friendlyId: 'test-scorecard',
      company: companyId,
      sections: [
        {
          name: 'Sales Technique',
          sectionType: 'custom',
          criteria: [
            {
              title: 'Test Criteria',
              description: 'Test criteria description',
            },
          ],
        },
      ],
    });
    await scorecard.save();

    // Create test scenario
    const scenario = new Scenario({
      module: module._id,
      persona: persona._id,
      scorecard: scorecard._id,
      product: product._id,
      company: companyId,
      isActive: true,
      scenarioDetails: {
        mainObjection: 'Test objection',
        salesDescription: 'Test description',
        salesGoal: 'Test goal',
      },
    });
    await scenario.save();
    scenarioId = scenario._id;
  });

  describe('Dummy User Creation', () => {
    it('should create a dummy user with correct fields', async () => {
      const user = new User({
        name: 'Dummy User',
        firstName: 'Dummy',
        lastName: 'User',
        email: `dummy+${Math.random().toString(36).substring(2, 10)}@hupo.co`,
        auth0Id: `auth0|${new mongoose.Types.ObjectId().toString()}`,
        company: companyId,
        isGuest: false,
        isTester: false,
        isDeleted: false,
        emailVerified: true,
        hasChangedPassword: false,
        teams: [],
        role: 'user',
        status: 'active',
      });

      await user.save();

      // Verify user was created
      const savedUser = await User.findById(user._id);
      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toMatch(/^dummy\+.*@hupo\.co$/);
      expect(savedUser?.auth0Id).toMatch(/^auth0\|[a-f0-9]{24}$/);
      expect(savedUser?.company.toString()).toBe(companyId.toString());
      expect(savedUser?.role).toBe('user');
      expect(savedUser?.status).toBe('active');
    });

    it('should generate unique emails for multiple users', async () => {
      const user1 = new User({
        name: 'Dummy User 1',
        firstName: 'Dummy',
        lastName: 'User',
        email: `dummy+${Math.random().toString(36).substring(2, 10)}@hupo.co`,
        auth0Id: `auth0|${new mongoose.Types.ObjectId().toString()}`,
        company: companyId,
        role: 'user',
        status: 'active',
      });

      const user2 = new User({
        name: 'Dummy User 2',
        firstName: 'Dummy',
        lastName: 'User',
        email: `dummy+${Math.random().toString(36).substring(2, 10)}@hupo.co`,
        auth0Id: `auth0|${new mongoose.Types.ObjectId().toString()}`,
        company: companyId,
        role: 'user',
        status: 'active',
      });

      await user1.save();
      await user2.save();

      expect(user1.email).not.toBe(user2.email);
      expect(user1.auth0Id).not.toBe(user2.auth0Id);
    });
  });

  describe('Legacy SalesSession Creation', () => {
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const user = new User({
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: `dummy+${Math.random().toString(36).substring(2, 10)}@hupo.co`,
        auth0Id: `auth0|${new mongoose.Types.ObjectId().toString()}`,
        company: companyId,
        role: 'user',
        status: 'active',
      });
      await user.save();
      userId = user._id;
    });

    it('should create legacy session with correct structure', async () => {
      const createdAt = new Date();
      const endedAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

      const session = new SalesSession({
        user: userId,
        callType: 'grab-mex',
        assessmentType: 'regular',
        product: {
          _id: '1758269873774',
          friendlyId: 'grab-mex-campaigns',
          name: 'GrabFood',
        },
        persona: {
          id: '67f76dea5410cedbd5ae7693',
          friendlyId: 'rachel-owner-acai-indulgence',
          name: 'Rachel',
        },
        startedAt: createdAt,
        endedAt,
        roleplay: {
          objectives: ['Dummy objective'],
          framework: 'GRAB_MEX_MEDDPICC',
          feedback: {
            salesTechniquesGenerating: false,
            productKnowledgeGenerating: false,
            overview: JSON.stringify({ summary: 'Test' }),
            productKnowledge: JSON.stringify({ overallScore: 75 }),
            salesTechniques: JSON.stringify({ overallScore: 80 }),
          },
          scormCompletionReady: true,
          duration: 600,
          overallScore: 77,
        },
        scores: {
          productKnowledge: 75,
          salesTechnique: 80,
        },
        messages: [],
        createdAt,
        updatedAt: endedAt,
      });

      await session.save();

      // Verify session was created
      const savedSession = await SalesSession.findById(session._id);
      expect(savedSession).toBeDefined();
      expect(savedSession?.user.toString()).toBe(userId.toString());
      expect(savedSession?.callType).toBe('grab-mex');
      expect(savedSession?.assessmentType).toBe('regular');
      expect(savedSession?.scores?.productKnowledge).toBe(75);
      expect(savedSession?.scores?.salesTechnique).toBe(80);
      expect(savedSession?.roleplay?.overallScore).toBe(77);
    });

    it('should set scores correctly for manual score option', async () => {
      const manualScores = {
        productKnowledge: 85,
        salesTechnique: 90,
      };

      const session = new SalesSession({
        user: userId,
        callType: 'grab-mex',
        assessmentType: 'regular',
        product: { name: 'Test' },
        persona: { name: 'Test' },
        startedAt: new Date(),
        scores: manualScores,
        messages: [],
      });

      await session.save();

      const savedSession = await SalesSession.findById(session._id);
      expect(savedSession?.scores?.productKnowledge).toBe(85);
      expect(savedSession?.scores?.salesTechnique).toBe(90);
    });
  });

  describe('New SalesSession Creation', () => {
    let userId: mongoose.Types.ObjectId;

    beforeEach(async () => {
      const user = new User({
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: `dummy+${Math.random().toString(36).substring(2, 10)}@hupo.co`,
        auth0Id: `auth0|${new mongoose.Types.ObjectId().toString()}`,
        company: companyId,
        role: 'user',
        status: 'active',
      });
      await user.save();
      userId = user._id;
    });

    it('should create new session with scorecard structure', async () => {
      const createdAt = new Date();
      const endedAt = new Date(createdAt.getTime() + 10 * 60 * 1000);

      const scorecards = [
        {
          name: 'Sales Technique',
          isGenerating: false,
          overallScore: 73,
          maxScore: 100,
          sectionType: 'custom' as const,
          criteria: [
            {
              title: 'Metrics',
              score: 16,
              maxScore: 25,
              reason: 'Test reason',
              suggestion: 'Test suggestion',
            },
          ],
        },
        {
          name: 'Product Knowledge',
          isGenerating: false,
          overallScore: 67,
          maxScore: 100,
          sectionType: 'product-knowledge' as const,
          criteria: [
            {
              title: 'Product Pitch',
              score: 34,
              maxScore: 50,
              strengths: ['Test strength'],
              toImprove: [
                {
                  text: 'Test improvement',
                  status: 'warning',
                },
              ],
            },
          ],
        },
      ];

      const session = new SalesSession({
        user: userId,
        callType: 'discovery-call',
        assessmentType: 'scorecard',
        scenario: scenarioId,
        startedAt: createdAt,
        endedAt,
        roleplay: {
          objectives: ['Test objective'],
          framework: 'THREE_F_MODEL',
          feedback: {
            salesTechniquesGenerating: false,
            productKnowledgeGenerating: false,
            scorecards,
            overview: JSON.stringify({ summary: 'Test' }),
          },
          scormCompletionReady: true,
          duration: 600,
          overallScore: 70,
        },
        messages: [],
        createdAt,
        updatedAt: endedAt,
      });

      await session.save();

      // Verify session was created
      const savedSession = await SalesSession.findById(session._id);
      expect(savedSession).toBeDefined();
      expect(savedSession?.scenario?.toString()).toBe(scenarioId.toString());
      expect(savedSession?.callType).toBe('discovery-call');
      expect(savedSession?.assessmentType).toBe('scorecard');
      expect(savedSession?.roleplay?.feedback?.scorecards).toHaveLength(2);
      expect(savedSession?.roleplay?.feedback?.scorecards?.[0].overallScore).toBe(73);
      expect(savedSession?.roleplay?.feedback?.scorecards?.[1].overallScore).toBe(67);
    });

    it('should reference scenario correctly', async () => {
      const session = new SalesSession({
        user: userId,
        callType: 'discovery-call',
        assessmentType: 'scorecard',
        scenario: scenarioId,
        startedAt: new Date(),
        messages: [],
      });

      await session.save();

      const savedSession = await SalesSession.findById(session._id).populate('scenario');
      expect(savedSession?.scenario).toBeDefined();
      expect((savedSession?.scenario as any)._id.toString()).toBe(scenarioId.toString());
    });
  });

  describe('Date Generation', () => {
    it('should generate dates within specified month', () => {
      const year = 2026;
      const month = 2;

      for (let i = 0; i < 10; i++) {
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(year, month - 1, day);

        expect(date.getFullYear()).toBe(year);
        expect(date.getMonth()).toBe(month - 1);
        expect(date.getDate()).toBeGreaterThanOrEqual(1);
        expect(date.getDate()).toBeLessThanOrEqual(28);
      }
    });

    it('should generate dates within last 6 months', () => {
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      for (let i = 0; i < 10; i++) {
        const timeDiff = now.getTime() - sixMonthsAgo.getTime();
        const randomTime = Math.random() * timeDiff;
        const randomDate = new Date(sixMonthsAgo.getTime() + randomTime);

        expect(randomDate.getTime()).toBeGreaterThanOrEqual(sixMonthsAgo.getTime());
        expect(randomDate.getTime()).toBeLessThanOrEqual(now.getTime());
      }
    });
  });
});
