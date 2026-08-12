import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { sendBulkInviteEmail } from './sendBulkInviteEmail.js';
import { BulkInvite } from '../../models/BulkInvite.js';
import { ManageUser } from '../../models/ManageUser.js';
import { User } from '../../models/User.js';
import { AllowlistManageUser } from '../../models/AllowlistManageUser.js';
import { Team } from '../../models/Team.js';
import { Company } from '../../models/Company.js';
import { sendEmail } from '../../utils/email.js';
import {
  BULK_INVITE_MAX_RETRIES,
  AGENDA_JOB_TYPES,
} from '../../utils/constants.js';

vi.mock('../../models/BulkInvite.js');
vi.mock('../../models/ManageUser.js');
vi.mock('../../models/User.js');
vi.mock('../../models/AllowlistManageUser.js');
vi.mock('../../models/Team.js');
vi.mock('../../models/Company.js');
vi.mock('../../utils/email.js');
vi.mock('../../utils/manage/shared.js', () => ({
  getAppUrl: vi.fn((role: string, companyFriendlyId?: string) => {
    if (role === 'user') {
      return `http://localhost:5361/${companyFriendlyId || ''}`;
    }
    return 'http://localhost:5361/manage';
  }),
}));
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn().mockReturnValue('<html>{{link}}</html>'),
  },
}));
vi.mock('ejs', () => ({
  default: {
    render: vi.fn().mockReturnValue('<html>rendered</html>'),
  },
}));
vi.mock('../../locale/translation.js', () => ({
  getTranslation: vi
    .fn()
    .mockReturnValue('Invitation to access Hupo Admin App'),
}));

describe('sendBulkInviteEmail job', () => {
  const bulkInviteId = new Types.ObjectId();
  const companyId = new Types.ObjectId();
  const salesTeamId = new Types.ObjectId();
  const marketingTeamId = new Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email successfully for admin user', async () => {
    const mockItem = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales'],
      isValid: true,
      emailSent: false,
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'superadmin@example.com',
      items: [mockItem],
      sentCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
    vi.mocked(Team.find).mockResolvedValue([
      { _id: salesTeamId, name: 'Sales' },
    ] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(ManageUser.create).mockResolvedValue({} as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockResolvedValue(undefined);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          companyId: companyId.toString(),
          inviterEmail: 'superadmin@example.com',
        },
      },
      agenda: {},
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should add to allowlist
    expect(AllowlistManageUser.findOneAndUpdate).toHaveBeenCalledWith(
      {
        email: 'admin@example.com',
        company: companyId,
      },
      {
        email: 'admin@example.com',
        company: companyId,
      },
      { upsert: true },
    );

    // Should create ManageUser
    expect(ManageUser.create).toHaveBeenCalledWith({
      email: 'admin@example.com',
      company: companyId,
      teams: [salesTeamId],
      role: 'admin',
      status: 'invited',
    });

    // Should send email
    expect(sendEmail).toHaveBeenCalled();

    // Should update item status using atomic operations
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: mockBulkInvite._id,
        'items.email': 'admin@example.com',
      },
      {
        $set: {
          'items.$.emailSent': true,
          'items.$.emailSentAt': expect.any(Date),
        },
        $inc: {
          sentCount: 1,
        },
      },
    );
  });

  it('should send email successfully for superadmin without teams', async () => {
    const mockItem = {
      email: 'superadmin@example.com',
      role: 'superadmin',
      teamNames: [],
      isValid: true,
      emailSent: false,
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [mockItem],
      sentCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(Team.find).mockResolvedValue([] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(ManageUser.create).mockResolvedValue({} as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockResolvedValue(undefined);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'superadmin@example.com',
          role: 'superadmin',
          teamNames: [],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: {},
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should create ManageUser with empty teams for superadmin
    expect(ManageUser.create).toHaveBeenCalledWith({
      email: 'superadmin@example.com',
      company: companyId,
      teams: [],
      role: 'superadmin',
      status: 'invited',
    });
  });

  it('should not send email if already sent', async () => {
    const mockItem = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales'],
      isValid: true,
      emailSent: true, // Already sent
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [mockItem],
      sentCount: 1,
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: {},
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should not send email
    expect(sendEmail).not.toHaveBeenCalled();
    expect(ManageUser.create).not.toHaveBeenCalled();
  });

  it('should retry on failure if retries not exceeded', async () => {
    const mockItem: any = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales'],
      isValid: true,
      emailSent: false,
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [mockItem],
      sentCount: 0,
      failedCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
    vi.mocked(Team.find).mockResolvedValue([
      { _id: salesTeamId, name: 'Sales' },
    ] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(ManageUser.create).mockResolvedValue({} as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockRejectedValue(new Error('SendGrid error'));

    const mockAgenda = {
      schedule: vi.fn().mockResolvedValue(undefined),
    };

    const mockJob = {
      attrs: {
        name: 'send-bulk-invite-email',
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: mockAgenda,
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should update error info using atomic operations
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: mockBulkInvite._id,
        'items.email': 'admin@example.com',
      },
      {
        $set: {
          'items.$.emailError': 'SendGrid error',
          'items.$.lastRetryAt': expect.any(Date),
        },
        $inc: {
          'items.$.retryCount': 1,
        },
      },
    );

    // Should schedule retry with correct job type
    expect(mockAgenda.schedule).toHaveBeenCalledWith(
      expect.any(Date),
      AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL,
      mockJob.attrs.data,
    );
    // failedCount should NOT be incremented on retry, only when max retries reached
    // Verify updateOne was not called with failedCount increment
    expect(mockUpdateOne).not.toHaveBeenCalledWith(
      { _id: mockBulkInvite._id },
      { $inc: { failedCount: 1 } },
    );
  });

  it('should not retry if max retries reached', async () => {
    const mockItem: any = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales'],
      isValid: true,
      emailSent: false,
      retryCount: BULK_INVITE_MAX_RETRIES - 1, // One before max
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [mockItem],
      sentCount: 0,
      failedCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
    vi.mocked(Team.find).mockResolvedValue([
      { _id: salesTeamId, name: 'Sales' },
    ] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(ManageUser.create).mockResolvedValue({} as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockRejectedValue(new Error('SendGrid error'));

    const mockAgenda = {
      schedule: vi.fn().mockResolvedValue(undefined),
    };

    const mockJob = {
      attrs: {
        name: 'send-bulk-invite-email',
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: mockAgenda,
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should update error info and increment retry count using atomic operations
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: mockBulkInvite._id,
        'items.email': 'admin@example.com',
      },
      {
        $set: {
          'items.$.emailError': 'SendGrid error',
          'items.$.lastRetryAt': expect.any(Date),
        },
        $inc: {
          'items.$.retryCount': 1,
        },
      },
    );

    // Should NOT schedule retry
    expect(mockAgenda.schedule).not.toHaveBeenCalled();

    // Should increment failedCount
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: mockBulkInvite._id },
      { $inc: { failedCount: 1 } },
    );
  });

  it('should throw error if required fields missing', async () => {
    const mockJob = {
      attrs: {
        data: {
          // Missing fields
        },
      },
      agenda: {},
    } as any;

    await expect(sendBulkInviteEmail(mockJob)).rejects.toThrow(
      'Missing required fields',
    );
  });

  it('should throw error if BulkInvite not found', async () => {
    vi.mocked(BulkInvite.findById).mockResolvedValue(null);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: [],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: {},
    } as any;

    await expect(sendBulkInviteEmail(mockJob)).rejects.toThrow(
      `BulkInvite ${bulkInviteId.toString()} not found`,
    );
  });

  it('should throw error if item not found in BulkInvite', async () => {
    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [],
      sentCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'notfound@example.com',
          role: 'admin',
          teamNames: [],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: {},
    } as any;

    await expect(sendBulkInviteEmail(mockJob)).rejects.toThrow(
      'Item not found for email notfound@example.com',
    );
  });

  it('should handle multiple teams correctly', async () => {
    const mockItem = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales', 'Marketing'],
      isValid: true,
      emailSent: false,
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [mockItem],
      sentCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(Team.find).mockResolvedValue([
      { _id: salesTeamId, name: 'Sales' },
      { _id: marketingTeamId, name: 'Marketing' },
    ] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(ManageUser.create).mockResolvedValue({} as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockResolvedValue(undefined);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales', 'Marketing'],
          companyId: companyId.toString(),
          inviterEmail: 'admin@example.com',
        },
      },
      agenda: {},
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should create ManageUser with both teams
    expect(ManageUser.create).toHaveBeenCalledWith({
      email: 'admin@example.com',
      company: companyId,
      teams: [salesTeamId, marketingTeamId],
      role: 'admin',
      status: 'invited',
    });
  });

  it('should handle revived soft-deleted ManageUser and continue with email send', async () => {
    const mockItem = {
      email: 'admin@example.com',
      role: 'admin',
      teamNames: ['Sales'],
      isValid: true,
      emailSent: false,
      retryCount: 0,
    };

    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'superadmin@example.com',
      items: [mockItem],
      sentCount: 0,
      save: vi.fn().mockResolvedValue(undefined),
    };

    const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);
    vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
    vi.mocked(Team.find).mockResolvedValue([
      { _id: salesTeamId, name: 'Sales' },
    ] as any);
    vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
      {} as any,
    );
    // Simulate a soft-deleted ManageUser being revived via findOneAndUpdate
    vi.mocked(ManageUser.findOneAndUpdate).mockResolvedValue(
      { email: 'admin@example.com', isDeleted: false } as any,
    );
    vi.mocked(User.findOneAndUpdate).mockResolvedValue(null as any);
    vi.mocked(Company.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
    } as any);
    vi.mocked(sendEmail).mockResolvedValue(undefined);

    const mockJob = {
      attrs: {
        data: {
          bulkInviteId: bulkInviteId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          companyId: companyId.toString(),
          inviterEmail: 'superadmin@example.com',
        },
      },
      agenda: {},
    } as any;

    await sendBulkInviteEmail(mockJob);

    // Should send email even when reviving an existing soft-deleted ManageUser
    expect(sendEmail).toHaveBeenCalled();

    // ManageUser.create should NOT be called since findOneAndUpdate revived an existing record
    expect(ManageUser.create).not.toHaveBeenCalled();

    // Should update item as sent using atomic operations
    expect(mockUpdateOne).toHaveBeenCalledWith(
      {
        _id: mockBulkInvite._id,
        'items.email': 'admin@example.com',
      },
      {
        $set: {
          'items.$.emailSent': true,
          'items.$.emailSentAt': expect.any(Date),
        },
        $inc: {
          sentCount: 1,
        },
      },
    );
  });

  describe('sendCompletionEmail', () => {
    it('should send success email when no errors (failedCount = 0, invalidCount = 0)', async () => {
      const mockItem = {
        email: 'admin@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false, // Not sent yet - this job will send it
        retryCount: 0,
      };

      const mockBulkInvite = {
        _id: bulkInviteId,
        company: companyId,
        uploadedByEmail: 'superadmin@example.com',
        fileName: 'test.csv',
        items: [mockItem],
        sentCount: 0,
        failedCount: 0,
        invalidCount: 0,
        status: 'processing',
        save: vi.fn().mockResolvedValue(undefined),
      };

      const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

      // First call returns the bulk invite before processing
      // Second call (in checkAndCompleteBulkInvite) returns updated bulk invite
      vi.mocked(BulkInvite.findById)
        .mockResolvedValueOnce(mockBulkInvite as any)
        .mockResolvedValueOnce({
          ...mockBulkInvite,
          sentCount: 1,
          items: [{ ...mockItem, emailSent: true }],
        } as any);
      vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
      vi.mocked(Team.find).mockResolvedValue([] as any);
      vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
        {} as any,
      );
      vi.mocked(ManageUser.create).mockResolvedValue({} as any);
      vi.mocked(Company.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
      } as any);
      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const mockJob = {
        attrs: {
          data: {
            bulkInviteId: bulkInviteId.toString(),
            email: 'admin@example.com',
            role: 'admin',
            teamNames: [],
            companyId: companyId.toString(),
            inviterEmail: 'superadmin@example.com',
          },
        },
        agenda: {},
      } as any;

      await sendBulkInviteEmail(mockJob);

      // Verify completion email was sent with success template
      const completionEmailCall = vi
        .mocked(sendEmail)
        .mock.calls.find(
          (call) =>
            !Array.isArray(call[0]) &&
            call[0].subject === 'Your user import is complete',
        );
      expect(completionEmailCall).toBeDefined();
    });

    it('should send error email when failedCount > 0', async () => {
      const mockItem1 = {
        email: 'admin@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false, // This is the last item being processed
        retryCount: 0,
      };

      const mockItem2 = {
        email: 'failed@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false,
        retryCount: BULK_INVITE_MAX_RETRIES, // Already reached max retries
      };

      const mockBulkInvite = {
        _id: bulkInviteId,
        company: companyId,
        uploadedByEmail: 'superadmin@example.com',
        fileName: 'test.csv',
        items: [mockItem1, mockItem2],
        sentCount: 0,
        failedCount: 1,
        invalidCount: 0,
        status: 'processing',
        save: vi.fn().mockResolvedValue(undefined),
      };

      const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

      // First call returns the bulk invite before processing
      // Second call (in checkAndCompleteBulkInvite) returns updated bulk invite
      vi.mocked(BulkInvite.findById)
        .mockResolvedValueOnce(mockBulkInvite as any)
        .mockResolvedValueOnce({
          ...mockBulkInvite,
          sentCount: 1,
          items: [
            { ...mockItem1, emailSent: true },
            { ...mockItem2, retryCount: BULK_INVITE_MAX_RETRIES },
          ],
        } as any);
      vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
      vi.mocked(Team.find).mockResolvedValue([] as any);
      vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
        {} as any,
      );
      vi.mocked(ManageUser.create).mockResolvedValue({} as any);
      vi.mocked(Company.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
      } as any);
      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const mockJob = {
        attrs: {
          data: {
            bulkInviteId: bulkInviteId.toString(),
            email: 'admin@example.com',
            role: 'admin',
            teamNames: [],
            companyId: companyId.toString(),
            inviterEmail: 'superadmin@example.com',
          },
        },
        agenda: {},
      } as any;

      await sendBulkInviteEmail(mockJob);

      // Verify completion email was sent with error template
      const completionEmailCall = vi
        .mocked(sendEmail)
        .mock.calls.find(
          (call) =>
            !Array.isArray(call[0]) &&
            call[0].subject === 'Your user import is complete (with errors)',
        );
      expect(completionEmailCall).toBeDefined();
    });

    it('should send error email when invalidCount > 0', async () => {
      const mockItem1 = {
        email: 'admin@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false, // This is the last valid item being processed
        retryCount: 0,
      };

      const mockItem2 = {
        email: 'invalid@example',
        role: 'admin',
        teamNames: [],
        isValid: false, // Invalid item - won't be processed
        emailSent: false,
        retryCount: 0,
      };

      const mockBulkInvite = {
        _id: bulkInviteId,
        company: companyId,
        uploadedByEmail: 'superadmin@example.com',
        fileName: 'test.csv',
        items: [mockItem1, mockItem2],
        sentCount: 0,
        failedCount: 0,
        invalidCount: 1,
        status: 'processing',
        save: vi.fn().mockResolvedValue(undefined),
      };

      const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

      // First call returns the bulk invite before processing
      // Second call (in checkAndCompleteBulkInvite) returns updated bulk invite
      vi.mocked(BulkInvite.findById)
        .mockResolvedValueOnce(mockBulkInvite as any)
        .mockResolvedValueOnce({
          ...mockBulkInvite,
          sentCount: 1,
          items: [{ ...mockItem1, emailSent: true }, mockItem2],
        } as any);
      vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
      vi.mocked(Team.find).mockResolvedValue([] as any);
      vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
        {} as any,
      );
      vi.mocked(ManageUser.create).mockResolvedValue({} as any);
      vi.mocked(Company.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
      } as any);
      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const mockJob = {
        attrs: {
          data: {
            bulkInviteId: bulkInviteId.toString(),
            email: 'admin@example.com',
            role: 'admin',
            teamNames: [],
            companyId: companyId.toString(),
            inviterEmail: 'superadmin@example.com',
          },
        },
        agenda: {},
      } as any;

      await sendBulkInviteEmail(mockJob);

      // Verify completion email was sent with error template
      const completionEmailCall = vi
        .mocked(sendEmail)
        .mock.calls.find(
          (call) =>
            !Array.isArray(call[0]) &&
            call[0].subject === 'Your user import is complete (with errors)',
        );
      expect(completionEmailCall).toBeDefined();
    });

    it('should send error email when both failedCount > 0 and invalidCount > 0', async () => {
      const mockItem1 = {
        email: 'admin@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false, // This is the last valid item being processed
        retryCount: 0,
      };

      const mockItem2 = {
        email: 'failed@example.com',
        role: 'admin',
        teamNames: [],
        isValid: true,
        emailSent: false,
        retryCount: BULK_INVITE_MAX_RETRIES, // Already reached max retries
      };

      const mockItem3 = {
        email: 'invalid@example',
        role: 'admin',
        teamNames: [],
        isValid: false, // Invalid item - won't be processed
        emailSent: false,
        retryCount: 0,
      };

      const mockBulkInvite = {
        _id: bulkInviteId,
        company: companyId,
        uploadedByEmail: 'superadmin@example.com',
        fileName: 'test.csv',
        items: [mockItem1, mockItem2, mockItem3],
        sentCount: 0,
        failedCount: 1,
        invalidCount: 1,
        status: 'processing',
        save: vi.fn().mockResolvedValue(undefined),
      };

      const mockUpdateOne = vi.fn().mockResolvedValue(undefined);

      // First call returns the bulk invite before processing
      // Second call (in checkAndCompleteBulkInvite) returns updated bulk invite
      vi.mocked(BulkInvite.findById)
        .mockResolvedValueOnce(mockBulkInvite as any)
        .mockResolvedValueOnce({
          ...mockBulkInvite,
          sentCount: 1,
          items: [
            { ...mockItem1, emailSent: true },
            { ...mockItem2, retryCount: BULK_INVITE_MAX_RETRIES },
            mockItem3,
          ],
        } as any);
      vi.mocked(BulkInvite.updateOne).mockImplementation(mockUpdateOne as any);
      vi.mocked(Team.find).mockResolvedValue([] as any);
      vi.mocked(AllowlistManageUser.findOneAndUpdate).mockResolvedValue(
        {} as any,
      );
      vi.mocked(ManageUser.create).mockResolvedValue({} as any);
      vi.mocked(Company.findById).mockReturnValue({
        select: vi.fn().mockResolvedValue({ friendlyId: 'test-company' }),
      } as any);
      vi.mocked(sendEmail).mockResolvedValue(undefined);

      const mockJob = {
        attrs: {
          data: {
            bulkInviteId: bulkInviteId.toString(),
            email: 'admin@example.com',
            role: 'admin',
            teamNames: [],
            companyId: companyId.toString(),
            inviterEmail: 'superadmin@example.com',
          },
        },
        agenda: {},
      } as any;

      await sendBulkInviteEmail(mockJob);

      // Verify completion email was sent with error template
      const completionEmailCall = vi
        .mocked(sendEmail)
        .mock.calls.find(
          (call) =>
            !Array.isArray(call[0]) &&
            call[0].subject === 'Your user import is complete (with errors)',
        );
      expect(completionEmailCall).toBeDefined();
    });
  });
});
