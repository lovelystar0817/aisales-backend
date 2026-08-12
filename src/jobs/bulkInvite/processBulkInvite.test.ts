import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { processBulkInvite } from './processBulkInvite.js';
import { BulkInvite } from '../../models/BulkInvite.js';
import { getAgenda } from '../agenda.js';
import { AGENDA_JOB_TYPES } from '../../utils/constants.js';

vi.mock('../../models/BulkInvite.js');
vi.mock('../agenda.js');

describe('processBulkInvite job', () => {
  const bulkInviteId = new Types.ObjectId();
  const companyId = new Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should schedule email jobs for all valid items', async () => {
    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [
        {
          email: 'user1@example.com',
          role: 'admin',
          teamNames: ['Sales'],
          isValid: true,
        },
        {
          email: 'user2@example.com',
          role: 'user',
          teamNames: ['Marketing'],
          isValid: true,
        },
        {
          email: 'invalid@example.com',
          role: 'user',
          teamNames: [],
          isValid: false, // Should be skipped
        },
      ],
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);

    const mockAgenda = {
      now: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getAgenda).mockReturnValue(mockAgenda as any);

    const mockJob = {
      attrs: {
        data: { bulkInviteId: bulkInviteId.toString() },
      },
    } as any;

    await processBulkInvite(mockJob);

    // Should schedule 2 email jobs (only valid items)
    expect(mockAgenda.now).toHaveBeenCalledTimes(2);
    expect(mockAgenda.now).toHaveBeenCalledWith(
      AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL,
      {
        bulkInviteId: bulkInviteId.toString(),
        email: 'user1@example.com',
        role: 'admin',
        teamNames: ['Sales'],
        companyId: companyId.toString(),
        inviterEmail: 'admin@example.com',
      },
    );
    expect(mockAgenda.now).toHaveBeenCalledWith(
      AGENDA_JOB_TYPES.SEND_BULK_INVITE_EMAIL,
      {
        bulkInviteId: bulkInviteId.toString(),
        email: 'user2@example.com',
        role: 'user',
        teamNames: ['Marketing'],
        companyId: companyId.toString(),
        inviterEmail: 'admin@example.com',
      },
    );
  });

  it('should mark as completed if no valid items', async () => {
    const mockBulkInvite = {
      _id: bulkInviteId,
      company: companyId,
      uploadedByEmail: 'admin@example.com',
      items: [
        {
          email: 'invalid@example.com',
          role: 'user',
          teamNames: [],
          isValid: false,
        },
      ],
      status: 'processing',
      save: vi.fn().mockResolvedValue(undefined),
    };

    vi.mocked(BulkInvite.findById).mockResolvedValue(mockBulkInvite as any);

    const mockAgenda = {
      now: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(getAgenda).mockReturnValue(mockAgenda as any);

    const mockJob = {
      attrs: {
        data: { bulkInviteId: bulkInviteId.toString() },
      },
    } as any;

    await processBulkInvite(mockJob);

    // Should not schedule any jobs
    expect(mockAgenda.now).not.toHaveBeenCalled();

    // Should mark as completed
    expect(mockBulkInvite.status).toBe('completed');
    expect(mockBulkInvite.save).toHaveBeenCalled();
  });

  it('should throw error if bulkInviteId is missing', async () => {
    const mockJob = {
      attrs: {
        data: {},
      },
    } as any;

    await expect(processBulkInvite(mockJob)).rejects.toThrow(
      'Missing bulkInviteId',
    );
  });

  it('should throw error if BulkInvite not found', async () => {
    vi.mocked(BulkInvite.findById).mockResolvedValue(null);

    const mockJob = {
      attrs: {
        data: { bulkInviteId: bulkInviteId.toString() },
      },
    } as any;

    await expect(processBulkInvite(mockJob)).rejects.toThrow(
      `BulkInvite ${bulkInviteId.toString()} not found`,
    );
  });
});
