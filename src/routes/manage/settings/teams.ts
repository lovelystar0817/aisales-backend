import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { Types } from 'mongoose';
import { Team } from '../../../models/Team.js';
import { ManageUser } from '../../../models/ManageUser.js';
import { User } from '../../../models/User.js';
import {
  logAdminAction,
  createUpdateDetails,
} from '../../../utils/adminLogger.js';

/**
 * Deduplicates users by email following these rules:
 * 1. If email only exists in one collection, use that record
 * 2. If email exists in both collections:
 *    - If ManageUser has status='invited' AND role='user', prefer User record
 *    - Otherwise, prefer ManageUser record (for active superadmin/admin users)
 */
function deduplicateUsersByEmail(
  manageUsers: any[],
  regularUsers: any[],
): any[] {
  const emailMap = new Map<string, any>();

  // First, add all User records to the map
  for (const user of regularUsers) {
    if (user.email) {
      emailMap.set(user.email, { ...user, source: 'User' });
    }
  }

  // Then, process ManageUser records with deduplication logic
  for (const manageUser of manageUsers) {
    if (manageUser.email) {
      const existingUser = emailMap.get(manageUser.email);

      if (!existingUser) {
        // Email only exists in ManageUser, add it
        emailMap.set(manageUser.email, {
          ...manageUser,
          source: 'ManageUser',
        });
      } else {
        // Email exists in both collections
        // If ManageUser is invited with role='user', keep the User record
        // Otherwise, prefer ManageUser record
        const isInvitedUser =
          manageUser.status === 'invited' && manageUser.role === 'user';

        if (!isInvitedUser) {
          // Prefer ManageUser for active superadmin/admin or active users
          emailMap.set(manageUser.email, {
            ...manageUser,
            source: 'ManageUser',
          });
        }
        // else: keep the User record that's already in the map
      }
    }
  }

  // Convert map values to array, excluding the 'source' field
  return Array.from(emailMap.values()).map(({ source, ...member }) => member);
}

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.use(app.checkAuth0JWT);
  app.addHook('preHandler', app.authenticateManage);

  // GET /manage/settings/teams
  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
        sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
      }),
    },
    async handler(req, reply) {
      try {
        const { page, limit, search } = req.query;
        const userRole = req.user?.role;
        const isAdmin = userRole === 'admin';

        // For admin users, only show "No team assigned" if role is superadmin
        let noTeamCount = 0;
        let shouldIncludeNoTeam = false;

        if (!isAdmin) {
          // Calculate "No Teams Assigned" count for superadmin with deduplication
          const noTeamManageUsers = await ManageUser.find({
            company: req.user?.company,
            $or: [
              { teams: { $exists: false } },
              { teams: { $size: 0 } },
              { teams: null },
            ],
            isDeleted: { $ne: true },
          })
            .select('email role status')
            .lean();

          const noTeamRegularUsers = await User.find({
            company: req.user?.company,
            $or: [
              { teams: { $exists: false } },
              { teams: { $size: 0 } },
              { teams: null },
            ],
            isDeleted: { $ne: true },
          })
            .select('email role status')
            .lean();

          // Deduplicate to get accurate count
          const uniqueNoTeamMembers = deduplicateUsersByEmail(
            noTeamManageUsers,
            noTeamRegularUsers,
          );
          noTeamCount = uniqueNoTeamMembers.length;

          // Check if "No team assigned" should be included based on search
          shouldIncludeNoTeam =
            noTeamCount > 0 &&
            (!search ||
              'no team assigned'.toLowerCase().includes(search.toLowerCase()));
        }

        // Build query for actual teams
        const query: any = {
          company: req.user?.company,
        };

        // For admin users, filter to only their teams
        // Query MongoDB directly to get the current admin user's teams
        if (isAdmin && req.user?._id) {
          const adminUser = await ManageUser.findById(req.user._id)
            .select('teams')
            .lean();

          if (adminUser && adminUser.teams) {
            query._id = { $in: adminUser.teams };
          }
        }

        // Add search filter if provided
        if (search) {
          query.name = { $regex: search, $options: 'i' };
        }

        // Get total count of actual teams
        const actualTeamsTotal = await Team.countDocuments(query);

        // Calculate total including virtual team
        const totalWithVirtual =
          actualTeamsTotal + (shouldIncludeNoTeam ? 1 : 0);

        // Calculate pagination for actual teams
        let teamsSkip = (page - 1) * limit;
        let teamsLimit = limit;

        // If virtual team is included and we're on page 1, adjust pagination
        if (shouldIncludeNoTeam && page === 1) {
          teamsLimit = limit - 1; // Leave space for virtual team
        } else if (shouldIncludeNoTeam && page > 1) {
          // Adjust skip to account for virtual team on page 1
          teamsSkip = teamsSkip - 1;
        }

        // Get actual teams
        const teams =
          teamsSkip >= 0
            ? await Team.find(query)
                .skip(Math.max(0, teamsSkip))
                .limit(Math.max(0, teamsLimit))
                .lean()
            : [];

        // Get team members for each team
        const teamsWithMembers = await Promise.all(
          teams.map(async (team) => {
            // Get ManageUsers in this team
            const manageUsers = await ManageUser.find({
              teams: team._id,
              isDeleted: { $ne: true },
            })
              .select('email role status')
              .lean();

            // Get regular Users in this team
            const regularUsers = await User.find({
              teams: team._id,
              isDeleted: { $ne: true },
            })
              .select('email role status')
              .lean();

            // Deduplicate to get accurate count
            const uniqueMembers = deduplicateUsersByEmail(
              manageUsers,
              regularUsers,
            );

            return {
              id: team._id.toString(),
              name: team.name,
              company: team.company,
              userCount: uniqueMembers.length,
              createdAt: team.createdAt,
              updatedAt: team.updatedAt,
              lastModifiedAt: team.lastModifiedAt,
              lastModifiedBy: team.lastModifiedBy,
              isVirtual: false,
            };
          }),
        );

        let finalTeams = teamsWithMembers;

        // Add virtual team at the beginning if on page 1 and should include
        if (shouldIncludeNoTeam && page === 1) {
          const noTeamEntry: any = {
            id: 'no-team',
            name: 'No team assigned',
            company: req.user?.company,
            userCount: noTeamCount,
            createdAt: null,
            updatedAt: null,
            lastModifiedAt: null,
            lastModifiedBy: null,
            isVirtual: true,
          };

          finalTeams = [noTeamEntry, ...teamsWithMembers];
        }

        // Calculate proper pagination info to match frontend expectations
        const currentCount = finalTeams.length;
        const startItem = totalWithVirtual === 0 ? 0 : (page - 1) * limit + 1;
        const endItem = Math.min(
          startItem + currentCount - 1,
          totalWithVirtual,
        );
        const totalPages = Math.ceil(totalWithVirtual / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return reply.status(200).send({
          teams: finalTeams,
          pagination: {
            currentPage: page, // Match frontend expectation
            limit,
            total: totalWithVirtual,
            totalTeams: totalWithVirtual, // Match frontend expectation
            totalPages, // Match frontend expectation
            pages: totalPages, // Keep for compatibility
            currentCount,
            startItem: totalWithVirtual === 0 ? 0 : startItem,
            endItem: totalWithVirtual === 0 ? 0 : endItem,
            hasNextPage, // Match frontend expectation
            hasPreviousPage,
          },
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching teams:');
        return reply.status(500).send({ error: 'Failed to fetch teams' });
      }
    },
  });

  // Create new team
  app.post('/', {
    schema: {
      body: z.object({
        name: z.string().min(1).max(100),
        emails: z.array(z.string().email()).optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const { name, emails } = req.body;

        const team = await Team.create({
          name,
          company: req.user?.company,
          lastModifiedAt: new Date(),
          lastModifiedBy: req.user?._id,
        });

        // Assign users to the team if emails provided
        if (emails && emails.length > 0) {
          // Find users by email in both collections, filtering by company
          const [manageUsers, regularUsers] = await Promise.all([
            ManageUser.find({
              email: { $in: emails },
              company: req.user?.company,
              isDeleted: { $ne: true },
            }).select('_id'),
            User.find({
              email: { $in: emails },
              company: req.user?.company,
              isDeleted: { $ne: true },
            }).select('_id'),
          ]);

          const manageUserIds = manageUsers.map((u) => u._id);
          const regularUserIds = regularUsers.map((u) => u._id);

          // Update ManageUsers
          if (manageUserIds.length > 0) {
            await ManageUser.updateMany(
              {
                _id: { $in: manageUserIds },
                company: req.user?.company,
              },
              { $addToSet: { teams: team._id } },
            );
          }

          // Update regular Users
          if (regularUserIds.length > 0) {
            await User.updateMany(
              {
                _id: { $in: regularUserIds },
                company: req.user?.company,
              },
              { $addToSet: { teams: team._id } },
            );
          }
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'team_created',
          category: 'team',
          targetType: 'Team',
          targetId: team._id,
          targetName: team.name,
          details: {
            emails: emails || [],
          },
        });

        return reply.status(201).send({
          id: team._id.toString(),
          name: team.name,
          company: team.company,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error creating team:');
        if (error.code === 11000) {
          return reply.status(400).send({ error: 'Team name already exists' });
        }
        return reply.status(500).send({ error: 'Failed to create team' });
      }
    },
  });

  // GET /manage/settings/teams/:teamId - New endpoint for getting team details
  app.get('/:teamId', {
    schema: {
      params: z.object({
        teamId: z.string(),
      }),
    },
    async handler(req, reply) {
      try {
        const { teamId } = req.params;
        const isNoTeam = teamId === 'no-team';

        // Fetch team data if not virtual
        let team = null;
        if (!isNoTeam) {
          team = await Team.findById(teamId)
            .populate('lastModifiedBy', 'email')
            .lean();

          if (!team) {
            return reply.status(404).send({ error: 'Team not found' });
          }
        }

        // Check access
        if (req.user?.role !== 'superadmin') {
          if (isNoTeam && !req.user?.company) {
            return reply.status(403).send({ error: 'Access denied' });
          }
          if (team && !team.company.equals(req.user?.company)) {
            return reply.status(403).send({ error: 'Access denied' });
          }
        }

        // Build dynamic query for members
        const memberQuery = {
          isDeleted: { $ne: true },
          ...(isNoTeam
            ? {
                $or: [
                  { teams: { $exists: false } },
                  { teams: { $size: 0 } },
                  { teams: null },
                ],
              }
            : { teams: team?._id }),
          company: req.user?.company,
        };

        // Get members from both collections
        const [manageUsers, regularUsers] = await Promise.all([
          ManageUser.find(memberQuery)
            .select('_id name firstName lastName email role status')
            .lean(),
          User.find(memberQuery)
            .select('_id name firstName lastName email role status')
            .lean(),
        ]);

        // Deduplicate members by email
        const allMembers = deduplicateUsersByEmail(manageUsers, regularUsers);

        // Build dynamic response
        return reply.send({
          id: isNoTeam ? 'no-team' : team?._id.toString(),
          name: isNoTeam ? 'No Team' : team?.name,
          company: team?.company || req.user?.company || null,
          members: allMembers,
          userCount: allMembers.length,
          isVirtual: isNoTeam,
          createdAt: team?.createdAt || null,
          updatedAt: team?.updatedAt || null,
          lastModifiedAt: team?.lastModifiedAt || null,
          lastModifiedBy: team?.lastModifiedBy || null,
        });
      } catch (error) {
        req.log.error({ err: error }, 'Error fetching team details:');
        return reply
          .status(500)
          .send({ error: 'Failed to fetch team details' });
      }
    },
  });

  // Update team
  app.put('/:teamId', {
    schema: {
      params: z.object({
        teamId: z.string(),
      }),
      body: z.object({
        name: z.string().min(1).max(100).optional(),
        emails: z.array(z.string().email()).optional(),
      }),
    },
    async handler(req, reply) {
      try {
        const { teamId } = req.params;
        const { name, emails } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
          return reply.status(404).send({ error: 'Team not found' });
        }

        // Check access
        if (
          req.user?.role !== 'superadmin' &&
          !team.company.equals(req.user?.company)
        ) {
          return reply.status(403).send({ error: 'Access denied' });
        }

        // Capture before state for logging
        const beforeName = team.name;

        // Update basic info
        if (name !== undefined) team.name = name;

        // Update modification tracking
        team.lastModifiedBy = req.user?._id;
        team.lastModifiedAt = new Date();

        await team.save();

        // Update team members if provided
        if (emails !== undefined) {
          const teamObjectId = new Types.ObjectId(teamId);

          // Remove team from all current members in both collections
          await ManageUser.updateMany(
            { teams: teamObjectId, company: req.user?.company },
            { $pull: { teams: teamObjectId } },
          );

          await User.updateMany(
            { teams: teamObjectId, company: req.user?.company },
            { $pull: { teams: teamObjectId } },
          );

          // Add team to new members if any provided
          if (emails.length > 0) {
            // Find users by email in both collections, filtering by company
            const [manageUsers, regularUsers] = await Promise.all([
              ManageUser.find({
                email: { $in: emails },
                company: req.user?.company,
                isDeleted: { $ne: true },
              }).select('_id'),
              User.find({
                email: { $in: emails },
                company: req.user?.company,
                isDeleted: { $ne: true },
              }).select('_id'),
            ]);

            const manageUserIds = manageUsers.map((u) => u._id);
            const regularUserIds = regularUsers.map((u) => u._id);

            // Add to ManageUsers
            if (manageUserIds.length > 0) {
              await ManageUser.updateMany(
                {
                  _id: { $in: manageUserIds },
                  company: req.user?.company,
                  isDeleted: { $ne: true },
                },
                { $addToSet: { teams: teamObjectId } },
              );
            }

            // Add to regular Users
            if (regularUserIds.length > 0) {
              await User.updateMany(
                {
                  _id: { $in: regularUserIds },
                  company: req.user?.company,
                  isDeleted: { $ne: true },
                },
                { $addToSet: { teams: teamObjectId } },
              );
            }
          }
        }

        // Log admin action
        await logAdminAction(req, {
          action: 'team_updated',
          category: 'team',
          targetType: 'Team',
          targetId: team._id,
          targetName: team.name,
          details: createUpdateDetails(
            { name: beforeName },
            { name: team.name, emails: emails },
          ),
        });

        return reply.send({
          id: team._id.toString(),
          name: team.name,
          company: team.company,
          updatedAt: team.updatedAt,
          lastModifiedAt: team.lastModifiedAt,
          lastModifiedBy: team.lastModifiedBy,
        });
      } catch (error: any) {
        req.log.error({ err: error }, 'Error updating team:');
        if (error.code === 11000) {
          return reply.status(400).send({ error: 'Team name already exists' });
        }
        return reply.status(500).send({ error: 'Failed to update team' });
      }
    },
  });
};

export default router;
