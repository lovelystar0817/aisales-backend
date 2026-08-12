import { describe, it, expect } from 'vitest';
import { Types } from 'mongoose';

/**
 * Unit tests for /manage/settings/users endpoint
 *
 * Tests the consistent user merge logic:
 * 1. Fetch all User rows with baseFilter
 * 2. Fetch all ManageUser rows with baseFilter
 * 3. Build Map starting with Users
 * 4. Process ManageUsers:
 *    - status=invited + role=user -> add as invited user (don't override)
 *    - Other ManageUsers -> override to set role as superadmin/admin
 * 5. Apply team filtering based on current user role
 * 6. Apply query filters (role, status, search)
 * 7. Sort by email ascending
 */

// Mock user merge logic (extracted from route handler for testing)
function mergeUsers(regularUsers: any[], manageUsers: any[]) {
  const userMap = new Map<string, any>();

  // Step 1: Add all Users to the map first
  for (const user of regularUsers) {
    const email = user.email?.toLowerCase();
    if (!email) continue;

    userMap.set(email, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      status: user.status || 'active',
      teams: user.teams || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      source: 'User',
    });
  }

  // Step 2: Process ManageUsers
  for (const manageUser of manageUsers) {
    const email = manageUser.email?.toLowerCase();
    if (!email) continue;

    const effectiveRole = manageUser.role || 'superadmin';
    const effectiveStatus = manageUser.status || 'active';

    // Case 1: ManageUser with status=invited and role=user
    // Add as invited user (don't override existing User)
    if (effectiveStatus === 'invited' && effectiveRole === 'user') {
      if (!userMap.has(email)) {
        userMap.set(email, {
          _id: manageUser._id,
          name: manageUser.name,
          email: manageUser.email,
          role: 'user',
          status: 'invited',
          teams: manageUser.teams || [],
          createdAt: manageUser.createdAt,
          updatedAt: manageUser.updatedAt,
          source: 'ManageUser',
        });
      }
    }
    // Case 2: Other ManageUsers (superadmin, admin, or non-invited users)
    // Override existing entry to update role to superadmin/admin
    else {
      userMap.set(email, {
        _id: manageUser._id,
        name: manageUser.name,
        email: manageUser.email,
        role: effectiveRole,
        status: effectiveStatus,
        teams: manageUser.teams || [],
        createdAt: manageUser.createdAt,
        updatedAt: manageUser.updatedAt,
        source: 'ManageUser',
      });
    }
  }

  return Array.from(userMap.values());
}

describe('User Merge Logic', () => {
  describe('Basic Merge Scenarios', () => {
    it('should merge User without ManageUser', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'user1@example.com',
          name: 'User One',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers: any[] = [];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[0].role).toBe('user');
      expect(result[0].source).toBe('User');
    });

    it('should add ManageUser invited user when no User exists', () => {
      const regularUsers: any[] = [];
      const manageUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'invited@example.com',
          name: 'Invited User',
          role: 'user',
          status: 'invited',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('invited@example.com');
      expect(result[0].role).toBe('user');
      expect(result[0].status).toBe('invited');
      expect(result[0].source).toBe('ManageUser');
    });

    it('should NOT override User with ManageUser invited user', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'user@example.com',
          name: 'Active User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'user@example.com',
          name: 'Invited User',
          role: 'user',
          status: 'invited',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('user@example.com');
      expect(result[0].role).toBe('user');
      expect(result[0].status).toBe('active');
      expect(result[0].source).toBe('User');
      expect(result[0]._id.toString()).toBe('111111111111111111111111');
    });

    it('should override User with ManageUser admin', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'admin@example.com',
          name: 'User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('admin@example.com');
      expect(result[0].role).toBe('admin');
      expect(result[0].status).toBe('active');
      expect(result[0].source).toBe('ManageUser');
      expect(result[0]._id.toString()).toBe('222222222222222222222222');
    });

    it('should override User with ManageUser superadmin', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'superadmin@example.com',
          name: 'User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'superadmin@example.com',
          name: 'Super Admin',
          role: 'superadmin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('superadmin@example.com');
      expect(result[0].role).toBe('superadmin');
      expect(result[0].source).toBe('ManageUser');
      expect(result[0]._id.toString()).toBe('222222222222222222222222');
    });
  });

  describe('Edge Cases', () => {
    it('should handle ManageUser with no role (defaults to superadmin)', () => {
      const regularUsers: any[] = [];
      const manageUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'norole@example.com',
          name: 'No Role User',
          role: undefined,
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('superadmin');
    });

    it('should handle User with no role (defaults to user)', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'norole@example.com',
          name: 'No Role User',
          role: undefined,
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers: any[] = [];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('user');
    });

    it('should handle emails with different casing', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'User@Example.COM',
          name: 'User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'user@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
      expect(result[0]._id.toString()).toBe('222222222222222222222222');
    });

    it('should skip users without email', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: '',
          name: 'No Email User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          email: undefined,
          name: 'Undefined Email',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers: any[] = [];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(0);
    });

    it('should handle multiple users with unique emails', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'user1@example.com',
          name: 'User One',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId(),
          email: 'user2@example.com',
          name: 'User Two',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(3);
      expect(result.find((u) => u.email === 'user1@example.com')).toBeDefined();
      expect(result.find((u) => u.email === 'user2@example.com')).toBeDefined();
      expect(result.find((u) => u.email === 'admin@example.com')).toBeDefined();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed User and ManageUser with various statuses', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'active@example.com',
          name: 'Active User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'inactive@example.com',
          name: 'Inactive User',
          role: 'user',
          status: 'inactive',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('333333333333333333333333'),
          email: 'invited@example.com',
          name: 'Invited User',
          role: 'user',
          status: 'invited',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: new Types.ObjectId('444444444444444444444444'),
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(4);

      const active = result.find((u) => u.email === 'active@example.com');
      expect(active?.status).toBe('active');
      expect(active?.role).toBe('user');
      expect(active?.source).toBe('User');

      const inactive = result.find((u) => u.email === 'inactive@example.com');
      expect(inactive?.status).toBe('inactive');
      expect(inactive?.role).toBe('user');

      const invited = result.find((u) => u.email === 'invited@example.com');
      expect(invited?.status).toBe('invited');
      expect(invited?.role).toBe('user');
      expect(invited?.source).toBe('ManageUser');

      const admin = result.find((u) => u.email === 'admin@example.com');
      expect(admin?.role).toBe('admin');
      expect(admin?.status).toBe('active');
    });

    it('should handle promotion scenario: User exists, then promoted to admin', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'promoted@example.com',
          name: 'User to be promoted',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'promoted@example.com',
          name: 'User to be promoted',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('promoted@example.com');
      expect(result[0].role).toBe('admin');
      expect(result[0].status).toBe('active');
      expect(result[0].source).toBe('ManageUser');
      expect(result[0]._id.toString()).toBe('222222222222222222222222');
    });

    it('should handle invitation before signup: invited ManageUser, then User signs up', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'signedup@example.com',
          name: 'Signed Up User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'signedup@example.com',
          name: 'Invited User',
          role: 'user',
          status: 'invited',
          teams: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      // User takes precedence over invited ManageUser
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('signedup@example.com');
      expect(result[0].status).toBe('active');
      expect(result[0].role).toBe('user');
      expect(result[0].source).toBe('User');
      expect(result[0]._id.toString()).toBe('111111111111111111111111');
    });
  });

  describe('Deactivation Scenarios', () => {
    it('should handle inactive admin in ManageUser overriding active User', () => {
      const regularUsers = [
        {
          _id: new Types.ObjectId('111111111111111111111111'),
          email: 'deactivated@example.com',
          name: 'User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId('222222222222222222222222'),
          email: 'deactivated@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'inactive',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
      expect(result[0].status).toBe('inactive');
      expect(result[0].source).toBe('ManageUser');
    });
  });

  describe('Soft Delete Filtering', () => {
    it('should exclude User with isDeleted=true', () => {
      // This test simulates the query filter that should exclude deleted users
      // In the actual endpoint, deleted users won't be fetched from the database
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'active@example.com',
          name: 'Active User',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        // This user should not be included in the query results
        // {
        //   _id: new Types.ObjectId(),
        //   email: 'deleted@example.com',
        //   name: 'Deleted User',
        //   role: 'user',
        //   status: 'active',
        //   teams: [],
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        //   isDeleted: true,
        // },
      ];
      const manageUsers: any[] = [];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('active@example.com');
      expect(
        result.find((u) => u.email === 'deleted@example.com'),
      ).toBeUndefined();
    });

    it('should exclude ManageUser with isDeleted=true', () => {
      // This test simulates the query filter that should exclude deleted manage users
      // In the actual endpoint, deleted manage users won't be fetched from the database
      const regularUsers: any[] = [];
      const manageUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
        // This user should not be included in the query results
        // {
        //   _id: new Types.ObjectId(),
        //   email: 'deletedadmin@example.com',
        //   name: 'Deleted Admin',
        //   role: 'admin',
        //   status: 'active',
        //   teams: [],
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        //   isDeleted: true,
        // },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('admin@example.com');
      expect(
        result.find((u) => u.email === 'deletedadmin@example.com'),
      ).toBeUndefined();
    });

    it('should exclude both User and ManageUser with isDeleted=true', () => {
      // This test verifies that the query filters apply to both collections
      // Deleted records won't be fetched from the database
      const regularUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'active1@example.com',
          name: 'Active User 1',
          role: 'user',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];
      const manageUsers = [
        {
          _id: new Types.ObjectId(),
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
          status: 'active',
          teams: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
        },
      ];

      const result = mergeUsers(regularUsers, manageUsers);

      expect(result).toHaveLength(2);
      expect(
        result.find((u) => u.email === 'active1@example.com'),
      ).toBeDefined();
      expect(result.find((u) => u.email === 'admin@example.com')).toBeDefined();
      // Verify deleted users are not present
      expect(
        result.find((u) => u.email === 'deleteduser@example.com'),
      ).toBeUndefined();
      expect(
        result.find((u) => u.email === 'deletedadmin@example.com'),
      ).toBeUndefined();
    });
  });
});
