import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Team } from '../../../models/Team.js';
import { ManageUser } from '../../../models/ManageUser.js';
import { User } from '../../../models/User.js';
import { getAgenda } from '../../../jobs/agenda.js';
import {
  AGENDA_JOB_TYPES,
  DEFAULT_LANGUAGE,
} from '../../../utils/constants.js';
import { Company } from '../../../models/Company.js';
import { AllowlistManageUser } from '../../../models/AllowlistManageUser.js';
import {
  buildBaseUserFilter,
  getAppUrl,
} from '../../../utils/manage/shared.js';
import { getEffectiveUserStatus } from '../../../utils/userStatus.js';
import {
  logAdminAction,
  createUpdateDetails,
} from '../../../utils/adminLogger.js';

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);
  // Backend fix - Update your route handler

  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
        roles: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((roles) => {
            if (!roles) return undefined;
            const roleArray = Array.isArray(roles) ? roles : roles.split(',');
            const filtered = roleArray.filter(
              (r) => r && r.trim() !== '' && r !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
        status: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((status) => {
            if (!status) return undefined;
            const statusArray = Array.isArray(status)
              ? status
              : status.split(',');
            const filtered = statusArray.filter(
              (s) => s && s.trim() !== '' && s !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
        teams: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((teams) => {
            if (!teams) return undefined;
            const teamArray = Array.isArray(teams) ? teams : teams.split(',');
            const filtered = teamArray.filter(
              (team) => team && team.trim() !== '' && team !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
      }),
    },
    async handler(req, reply) {
      try {
        const { page, limit, search, roles, status, teams } = req.query;
        const skip = (page - 1) * limit;

        // Step 1: Build base filter for company scoping and tester exclusion
        // includeDeleted defaults to false, which adds isDeleted: { $ne: true } filter
        const baseConditions = buildBaseUserFilter(
          req.user?.company?.toString(),
          undefined,
          false,
        );

        // Step 2: Fetch all Users from User collection with baseFilter (exclude deleted)
        const regularUsers = await User.find(baseConditions)
          .populate('teams', 'name')
          .select(
            '_id name email role teams status createdAt updatedAt isDeleted',
          )
          .lean();

        // Step 3: Fetch all ManageUsers from ManageUser collection with baseFilter (exclude deleted)
        const manageUsers = await ManageUser.find(baseConditions)
          .populate('teams', 'name')
          .select(
            '_id name email role status teams createdAt updatedAt isDeleted',
          )
          .lean();

        // Step 4: Build a Map to merge users consistently
        // Key: lowercase email, Value: merged user object
        const userMap = new Map<string, any>();

        // Step 5: Add all Users to the map first
        for (const user of regularUsers) {
          const email = user.email?.toLowerCase();
          if (!email) continue;

          userMap.set(email, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: 'user',
            status: getEffectiveUserStatus(user),
            teams: user.teams || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            source: 'User',
          });
        }

        // Step 6: Process ManageUsers
        for (const manageUser of manageUsers) {
          const email = manageUser.email?.toLowerCase();
          if (!email) continue;

          const effectiveRole = manageUser.role || 'superadmin';
          const effectiveStatus = getEffectiveUserStatus(manageUser);

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

        // Step 7: Convert map to array
        let allUsers = Array.from(userMap.values());

        // Step 8: Apply team filtering based on user role
        // For admin users without explicit team filter, filter by their teams
        let teamObjectIds: Types.ObjectId[] = [];
        if (teams && teams.length > 0) {
          // User explicitly selected teams
          try {
            teamObjectIds = teams.map((id: string) => new Types.ObjectId(id));
          } catch (err) {
            console.error('Invalid team ObjectIds:', teams);
            return reply.status(400).send({ error: 'Invalid team IDs' });
          }
        } else if (req.user?.role === 'admin' && req.user?.teams?.length) {
          // Admin without explicit team filter - use their teams
          teamObjectIds = req.user.teams;
        }

        // Apply team filtering
        if (teamObjectIds.length > 0) {
          allUsers = allUsers.filter((user) => {
            if (!user.teams || user.teams.length === 0) return false;
            return user.teams.some((team: any) =>
              teamObjectIds.some((id) => id.equals(team._id)),
            );
          });
        }

        // Step 9: Apply query filters (role, status, search)
        if (roles && roles.length > 0) {
          allUsers = allUsers.filter((user) => {
            const userRole = user.role || 'user';
            return roles.includes(userRole);
          });
        }

        if (status && status.length > 0) {
          allUsers = allUsers.filter((user) => {
            const userStatus = user.status || 'active';
            return status.includes(userStatus);
          });
        }

        if (search) {
          const searchLower = search.toLowerCase();
          allUsers = allUsers.filter((user) => {
            const nameMatch = user.name?.toLowerCase().includes(searchLower);
            const emailMatch = user.email?.toLowerCase().includes(searchLower);
            return nameMatch || emailMatch;
          });
        }

        // Step 10: Sort by email ascending
        allUsers.sort((a, b) =>
          (a.email || '')
            .toLowerCase()
            .localeCompare((b.email || '').toLowerCase()),
        );

        // Step 11: Apply pagination
        const totalUsers = allUsers.length;
        const totalPages = Math.ceil(totalUsers / limit);
        const paginatedUsers = allUsers.slice(skip, skip + limit);

        return reply.send({
          users: paginatedUsers.map((user) => ({
            id: user._id?.toString() || '',
            name: user.name || '',
            email: user.email || '',
            role: user.role || 'user',
            status: user.status || 'active',
            teams: (user.teams || []).map((team: any) => ({
              id: team?._id?.toString() || '',
              name: team?.name || '',
            })),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        });
      } catch (error: any) {
        console.error('Error in users route:', error);
        return reply.status(500).send({
          error: 'Failed to fetch users',
          details: error.message,
        });
      }
    },
  });

  // Update user
  app.put('/:email', {
    schema: {
      params: z.object({
        email: z.string().email(),
      }),
      body: z.object({
        // ManageUser fields
        role: z.enum(['superadmin', 'admin', 'user']).optional(),
        teamIds: z.array(z.string()).optional(), // For ManageUser (multiple teams)
      }),
    },
    async handler(req, reply) {
      try {
        const { email } = req.params;
        const { role, teamIds } = req.body;

        const normalizedEmail = email.toLowerCase();

        // Find user in both collections concurrently
        const [manageUser, regularUser] = await Promise.all([
          ManageUser.findOne({
            email: normalizedEmail,
            company: req.user?.company,
            isDeleted: { $ne: true },
          }),
          User.findOne({
            email: normalizedEmail,
            company: req.user?.company,
            isDeleted: { $ne: true },
          }),
        ]);

        // Check if user exists in at least one collection
        if (!manageUser && !regularUser) {
          return reply.status(404).send({ error: 'User not found' });
        }

        // Determine the current/previous role
        const previousRole =
          manageUser?.role ||
          (manageUser ? 'superadmin' : regularUser?.role || 'user');

        const newRole = role !== undefined ? role : previousRole;

        // Capture before state for logging
        const beforeState = {
          role: previousRole,
          teams:
            (manageUser?.teams || regularUser?.teams)?.map((t: any) =>
              t.toString(),
            ) || [],
        };

        // Validate teams if teamIds provided
        let validatedTeams: Types.ObjectId[] | undefined;
        if (teamIds !== undefined) {
          const teams = await Team.find({
            _id: { $in: teamIds.map((id: string) => new Types.ObjectId(id)) },
            company: req.user?.company,
          });

          if (teams.length !== teamIds.length) {
            return reply
              .status(400)
              .send({ error: 'One or more teams not found or invalid' });
          }

          validatedTeams = teams.map((team) => team._id);
        }

        const roleChanged = role !== undefined && previousRole !== newRole;
        const teamsChanged = teamIds !== undefined;

        // Get the source user for copying data
        const sourceUser = manageUser || regularUser;

        if (roleChanged) {
          // Case 1: User promoted to Admin/Superadmin
          if (
            previousRole === 'user' &&
            (newRole === 'admin' || newRole === 'superadmin')
          ) {
            // Check if ManageUser exists (including soft-deleted)
            const existingManageUser = await ManageUser.findOne({
              email: normalizedEmail,
              company: req.user?.company,
            });

            if (existingManageUser) {
              // Update existing ManageUser (even if soft-deleted)
              existingManageUser.role = newRole;
              existingManageUser.isDeleted = false;
              existingManageUser.status = 'active';
              if (validatedTeams !== undefined) {
                existingManageUser.teams = validatedTeams;
              }
              await existingManageUser.save();
            } else {
              // Create new ManageUser
              await ManageUser.create({
                email: sourceUser!.email,
                auth0Id: sourceUser!.auth0Id,
                company: sourceUser!.company,
                teams:
                  validatedTeams !== undefined
                    ? validatedTeams
                    : sourceUser!.teams,
                role: newRole,
                status: 'active',
                name: sourceUser!.name,
                firstName: sourceUser!.firstName,
                lastName: sourceUser!.lastName,
              });
            }

            // Update teams in User collection if it exists and teams changed
            if (regularUser && validatedTeams !== undefined) {
              regularUser.teams = validatedTeams;
              await regularUser.save();
            }
          }
          // Case 2: Admin/Superadmin demoted to User
          else if (
            (previousRole === 'admin' || previousRole === 'superadmin') &&
            newRole === 'user'
          ) {
            // Check if User exists (including soft-deleted)
            const existingUser = await User.findOne({
              email: normalizedEmail,
              company: req.user?.company,
            });

            if (existingUser) {
              // Update existing User (even if soft-deleted)
              existingUser.role = 'user';
              existingUser.isDeleted = false;
              existingUser.status = 'active';
              if (validatedTeams !== undefined) {
                existingUser.teams = validatedTeams;
              }
              await existingUser.save();
            } else {
              // Create new User
              await User.create({
                email: sourceUser!.email,
                auth0Id: sourceUser!.auth0Id,
                company: sourceUser!.company,
                teams:
                  validatedTeams !== undefined
                    ? validatedTeams
                    : sourceUser!.teams,
                role: 'user',
                status: 'active',
                name: sourceUser!.name,
                firstName: sourceUser!.firstName,
                lastName: sourceUser!.lastName,
              });
            }

            // Delete ManageUser from database
            if (manageUser) {
              await ManageUser.deleteOne({ _id: manageUser._id });
            }
          }
          // Case 3: Admin <-> Superadmin (same collection)
          else {
            if (manageUser) {
              manageUser.role = newRole;
              if (validatedTeams !== undefined) {
                manageUser.teams = validatedTeams;
              }
              await manageUser.save();
            }

            // Also update teams in User collection if it exists
            if (regularUser && validatedTeams !== undefined) {
              regularUser.teams = validatedTeams;
              await regularUser.save();
            }
          }
        } else if (teamsChanged) {
          // Only teams changed, no role change
          // Apply to both collections if applicable
          if (manageUser && validatedTeams !== undefined) {
            manageUser.teams = validatedTeams;
            await manageUser.save();
          }

          if (regularUser && validatedTeams !== undefined) {
            regularUser.teams = validatedTeams;
            await regularUser.save();
          }
        }

        // Handle email sending
        const shouldSendInviteEmail =
          roleChanged &&
          previousRole === 'user' &&
          (newRole === 'admin' || newRole === 'superadmin');

        const shouldSendUpdateRoleEmail =
          roleChanged &&
          // admin to superadmin
          ((previousRole === 'admin' && newRole === 'superadmin') ||
            // superadmin to admin
            (previousRole === 'superadmin' && newRole === 'admin'));

        if (shouldSendInviteEmail) {
          const agenda = getAgenda();
          const appUrl = getAppUrl(newRole);

          await agenda.now(AGENDA_JOB_TYPES.SEND_INVITE_EMAIL, {
            email: normalizedEmail,
            link: appUrl,
            languageCode: DEFAULT_LANGUAGE,
            role: newRole,
            inviterEmail: req.user?.email,
          });
        } else if (shouldSendUpdateRoleEmail) {
          const agenda = getAgenda();
          const appUrl = getAppUrl(newRole);

          await agenda.now(AGENDA_JOB_TYPES.SEND_UPDATE_ROLE_EMAIL, {
            email: normalizedEmail,
            previousRole,
            newRole,
            link: appUrl,
          });
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'user_role_updated',
          category: 'user',
          targetType: 'User',
          targetId: sourceUser!._id,
          targetName: normalizedEmail,
          details: createUpdateDetails(beforeState, {
            role: newRole,
            teams:
              validatedTeams?.map((id: Types.ObjectId) => id.toString()) ||
              beforeState.teams,
          }),
        });

        return reply.send({
          success: true,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error updating user:');
        return reply.status(500).send({ error: 'Failed to update user' });
      }
    },
  });

  // Deactivate user (soft delete)
  app.delete('/:email', {
    schema: {
      params: z.object({
        email: z.string().email(),
      }),
    },
    async handler(req, reply) {
      try {
        const { email } = req.params;
        const normalizedEmail = email.toLowerCase();

        // Find user in both collections concurrently
        const [manageUser, regularUser] = await Promise.all([
          ManageUser.findOne({
            email: normalizedEmail,
            company: req.user?.company,
          }),
          User.findOne({
            email: normalizedEmail,
            company: req.user?.company,
          }),
        ]);

        // Check if user exists in at least one collection
        if (!manageUser && !regularUser) {
          return reply.status(404).send({ error: 'User not found' });
        }

        // Determine the effective role and primary record
        const primaryUser = manageUser || regularUser;
        const effectiveRole =
          manageUser?.role ||
          (manageUser ? 'superadmin' : regularUser?.role || 'user');

        // Update based on role
        if (effectiveRole === 'admin' || effectiveRole === 'superadmin') {
          // For admin/superadmin: update ManageUser (must exist) and User (if exists)
          if (manageUser) {
            manageUser.status = 'inactive';
            manageUser.isDeleted = false;
            await manageUser.save();
          }

          if (regularUser) {
            regularUser.status = 'inactive';
            regularUser.isDeleted = false;
            await regularUser.save();
          }
        } else {
          // For regular user: update ManageUser if exists (e.g. invited users)
          // and User collection if exists
          if (manageUser) {
            manageUser.status = 'inactive';
            await manageUser.save();
          }
          if (regularUser) {
            regularUser.status = 'inactive';
            await regularUser.save();
          }
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'user_deactivated',
          category: 'user',
          targetType: 'User',
          targetId: primaryUser!._id,
          targetName: primaryUser!.email,
        });

        return reply.send({
          success: true,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error updating user:');
        return reply.status(500).send({ error: 'Failed to update user' });
      }
    },
  });

  // Reactivate user (restore from soft delete)
  app.put('/:email/reactivate', {
    schema: {
      params: z.object({
        email: z.string().email(),
      }),
    },
    async handler(req, reply) {
      try {
        const { email } = req.params;
        const normalizedEmail = email.toLowerCase();

        // Find user in both collections concurrently (including soft deleted ones)
        const [manageUser, regularUser] = await Promise.all([
          ManageUser.findOne({
            email: normalizedEmail,
            company: req.user?.company,
          }),
          User.findOne({
            email: normalizedEmail,
            company: req.user?.company,
          }),
        ]);

        // Check if user exists in at least one collection
        if (!manageUser && !regularUser) {
          return reply.status(404).send({ error: 'User not found' });
        }

        // Determine the effective role and primary record
        const primaryUser = manageUser || regularUser;
        const effectiveRole =
          manageUser?.role ||
          (manageUser ? 'superadmin' : regularUser?.role || 'user');

        // Update based on role
        if (effectiveRole === 'admin' || effectiveRole === 'superadmin') {
          // For admin/superadmin: update ManageUser (must exist) and User (if exists)
          if (manageUser) {
            manageUser.status = 'active';
            manageUser.isDeleted = false;
            await manageUser.save();
          }

          if (regularUser) {
            regularUser.status = 'active';
            regularUser.isDeleted = false;
            await regularUser.save();
          }
        } else {
          // For regular user: update ManageUser if exists (e.g. invited users)
          // and User collection if exists
          if (manageUser) {
            manageUser.status = 'active';
            manageUser.isDeleted = false;
            await manageUser.save();
          }
          if (regularUser) {
            regularUser.status = 'active';
            regularUser.isDeleted = false;
            await regularUser.save();
          }
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'user_reactivated',
          category: 'user',
          targetType: 'User',
          targetId: primaryUser!._id,
          targetName: primaryUser!.email,
        });

        return reply.send({
          success: true,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error reactivating user:');
        return reply.status(500).send({ error: 'Failed to reactivate user' });
      }
    },
  });

  /**
   * @method GET /manage/settings/filter-teams
   * @description Get available teams for user management filters
   */
  app.get('/filter-teams', {
    async handler(req, reply) {
      try {
        const { _id: userId, role, company } = req.user as any;

        // For non-superadmin users, fetch user data to get team assignments
        let teamQuery: any = { company };

        if (role === 'admin' && req.user?.teams?.length) {
          teamQuery = { _id: { $in: req.user?.teams } };
        }

        // Fetch teams based on user role and permissions
        const teams = await Team.find(teamQuery)
          .select('_id name')
          .sort({ name: 1 })
          .lean(); // Use lean() for better performance since we don't need full Mongoose documents

        // Transform teams data for frontend consumption
        const filterTeams = teams.map((team) => ({
          id: team._id.toString(),
          name: team.name,
        }));

        req.log.info(
          `Fetched ${teams.length} teams for user ${userId} with role ${role}`,
        );

        return reply.send({
          teams: filterTeams,
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error fetching filter teams:');

        return reply.status(500).send({
          error: 'Failed to fetch filter teams',
        });
      }
    },
  });

  // Add this route after your existing routes in the router

  // Invite user
  app.post('/invite', {
    schema: {
      body: z.object({
        email: z.string().email(),
        role: z.enum(['superadmin', 'admin', 'user']),
        teamIds: z
          .array(z.string())
          .optional()
          .transform((teams) => {
            if (!teams) return undefined;
            const filtered = teams.filter(
              (team) => team && team.trim() !== '' && team !== 'all',
            );
            return filtered.length > 0 ? filtered : undefined;
          }),
      }),
    },
    async handler(req, reply) {
      try {
        const { email, role, teamIds } = req.body;

        // Validate inviting user permissions
        if (req.user?.role !== 'superadmin') {
          return reply.status(403).send({
            error: 'Insufficient permissions to invite users',
          });
        }

        const normalizedEmail = email.toLowerCase();

        // Check if email already exists (non-deleted) in BOTH collections
        const [existingManageUser, existingUser] = await Promise.all([
          ManageUser.findOne({
            email: normalizedEmail,
            company: req.user?.company,
            isDeleted: { $ne: true },
          }),
          User.findOne({
            email: normalizedEmail,
            company: req.user?.company,
            isDeleted: { $ne: true },
          }),
        ]);

        if (existingManageUser || existingUser) {
          const existingStatus =
            existingManageUser?.status || existingUser?.status || 'active';

          return reply.status(400).send({
            error: 'User with this email already exists in your organization',
            userExists: true,
            userStatus: existingStatus,
          });
        }

        // Process team assignments
        let processedTeamIds: Types.ObjectId[] = [];

        if (teamIds) {
          const validTeams = await Team.find({
            _id: { $in: teamIds.map((id: string) => new Types.ObjectId(id)) },
            company: req.user?.company,
            isDeleted: { $ne: true },
          });

          processedTeamIds = validTeams.map((team) => team._id);
        }

        let newUser;

        if (role === 'user') {
          // Upsert: reuse soft-deleted User record if exists, otherwise create
          newUser = await User.findOneAndUpdate(
            {
              email: normalizedEmail,
              company: req.user?.company,
              isDeleted: true,
            },
            {
              $set: {
                isDeleted: false,
                status: 'invited',
                teams: processedTeamIds,
                role: 'user',
              },
              $unset: { auth0Id: '' },
            },
            { new: true },
          );

          if (!newUser) {
            newUser = await User.create({
              email: normalizedEmail,
              company: req.user?.company,
              status: 'invited',
              teams: processedTeamIds,
            });
          }

          await ManageUser.deleteOne({
            email: normalizedEmail,
            company: req.user?.company,
          });
        } else {
          // Upsert AllowlistManageUser (unique index on email+company)
          await AllowlistManageUser.findOneAndUpdate(
            { email: normalizedEmail, company: req.user?.company },
            { email: normalizedEmail, company: req.user?.company },
            { upsert: true },
          );

          // Upsert: reuse soft-deleted ManageUser record if exists, otherwise create
          newUser = await ManageUser.findOneAndUpdate(
            {
              email: normalizedEmail,
              company: req.user?.company,
              isDeleted: true,
            },
            {
              $set: {
                isDeleted: false,
                status: 'invited',
                role: role,
                teams: role === 'superadmin' ? [] : processedTeamIds,
              },
              $unset: { auth0Id: '' },
            },
            { new: true },
          );

          if (!newUser) {
            newUser = await ManageUser.create({
              email: normalizedEmail,
              company: req.user?.company,
              role: role,
              status: 'invited',
              teams:
                role === 'superadmin'
                  ? null
                  : processedTeamIds
                    ? processedTeamIds
                    : undefined,
            });
          }

          // Revive User row with matched email, set isDeleted = false (if exists)
          await User.findOneAndUpdate(
            {
              email: normalizedEmail,
              company: req.user?.company,
            },
            {
              $set: {
                isDeleted: false,
                status: 'invited',
                teams:
                  role === 'superadmin'
                    ? null
                    : processedTeamIds
                      ? processedTeamIds
                      : undefined,
              },
            },
          );
        }

        // Fetch company for user role (needed for URL generation)
        const company = await Company.findById(req.user?.company).select(
          'friendlyId',
        );

        const appUrl = getAppUrl(role, company?.friendlyId);

        const agenda = getAgenda();
        await agenda.now(AGENDA_JOB_TYPES.SEND_INVITE_EMAIL, {
          email,
          link: appUrl,
          languageCode: DEFAULT_LANGUAGE,
          role,
          inviterEmail: req.user?.email,
        });

        // Log admin action
        await logAdminAction(req, {
          action: 'user_invited',
          category: 'user',
          targetType: 'User',
          targetId: newUser._id,
          targetName: newUser.email,
          details: {
            role,
            teamIds: processedTeamIds.map((t) => t.toString()),
          },
        });

        // Prepare response
        const responseTeams =
          role === 'superadmin'
            ? [] // Always empty for superadmin
            : (newUser.teams as any[])?.map((team) => ({
                id: team._id.toString(),
                name: team.name,
              })) || [];

        return reply.status(201).send({
          success: true,
          user: {
            id: newUser._id.toString(),
            email: newUser.email,
            role: role,
            status: newUser.status,
            teams: responseTeams,
          },
          message: 'User invitation sent successfully',
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error inviting user:');
        return reply.status(500).send({
          error: 'Failed to invite user',
          details: error.message,
        });
      }
    },
  });
};

export default router;
