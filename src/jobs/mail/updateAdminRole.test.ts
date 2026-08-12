import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendUpdateRoleEmail } from './updateAdminRole.js';
import type { Job } from '@hokify/agenda';
import * as emailUtils from '../../utils/email.js';
import fs from 'fs';
import path from 'path';

// Mock the email module
vi.mock('../../utils/email.js', () => ({
  sendEmail: vi.fn(),
  EMAIL_CATEGORY: {
    INVITE_ADMIN: 'invite-admin',
    INVITE_USER: 'invite-user',
    UPDATE_ADMIN_ROLE: 'update-admin-role',
  },
}));

// Mock fs for template reading
vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

describe('sendUpdateRoleEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock template content
    vi.mocked(fs.readFileSync).mockReturnValue(
      '<html><body>Role: <%= previousRole %> to <%= newRole %>. Link: <%= link %></body></html>',
    );
  });

  it('should send email with correct role display names', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(emailUtils.sendEmail).toHaveBeenCalledWith({
      from: {
        name: 'Hupo',
        email: process.env.NOTIFY_EMAIL ?? '',
      },
      to: 'test@example.com',
      subject: 'Your Hupo Admin Access Has Been Updated',
      html: expect.stringContaining('User'),
      text: expect.stringContaining('Admin'),
      category: 'update-admin-role',
    });
  });

  it('should handle user to superadmin role change', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'user@example.com',
          previousRole: 'user',
          newRole: 'superadmin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        html: expect.stringContaining('Superadmin'),
      }),
    );
  });

  it('should handle admin to superadmin role change', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'admin@example.com',
          previousRole: 'admin',
          newRole: 'superadmin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@example.com',
        html: expect.stringContaining('Admin'),
      }),
    );
  });

  it('should handle superadmin to admin role change', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'superadmin@example.com',
          previousRole: 'superadmin',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'superadmin@example.com',
        html: expect.stringContaining('Superadmin'),
      }),
    );
  });

  it('should throw error when email is missing', async () => {
    const mockJob = {
      attrs: {
        data: {
          previousRole: 'user',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await expect(sendUpdateRoleEmail(mockJob)).rejects.toThrow(
      'Missing required fields: email, previousRole, newRole, or link',
    );
  });

  it('should throw error when previousRole is missing', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await expect(sendUpdateRoleEmail(mockJob)).rejects.toThrow(
      'Missing required fields: email, previousRole, newRole, or link',
    );
  });

  it('should throw error when newRole is missing', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await expect(sendUpdateRoleEmail(mockJob)).rejects.toThrow(
      'Missing required fields: email, previousRole, newRole, or link',
    );
  });

  it('should throw error when link is missing', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          newRole: 'admin',
        },
      },
    } as Job<any>;

    await expect(sendUpdateRoleEmail(mockJob)).rejects.toThrow(
      'Missing required fields: email, previousRole, newRole, or link',
    );
  });

  it('should read the correct template file', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(fs.readFileSync).toHaveBeenCalledWith(
      path.join(process.cwd(), 'src/views/email/update_admin_role.html'),
      'utf8',
    );
  });

  it('should use correct email category', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    await sendUpdateRoleEmail(mockJob);

    expect(emailUtils.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'update-admin-role',
      }),
    );
  });

  it('should propagate errors from sendEmail', async () => {
    const mockJob = {
      attrs: {
        data: {
          email: 'test@example.com',
          previousRole: 'user',
          newRole: 'admin',
          link: 'https://app.hupo.co/',
        },
      },
    } as Job<any>;

    const testError = new Error('SendGrid API error');
    vi.mocked(emailUtils.sendEmail).mockRejectedValueOnce(testError);

    // Suppress console.error output during error testing
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(sendUpdateRoleEmail(mockJob)).rejects.toThrow(
      'SendGrid API error',
    );

    consoleErrorSpy.mockRestore();
  });
});
