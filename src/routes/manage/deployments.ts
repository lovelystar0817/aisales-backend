import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const DeploymentSchema = z.object({
  name: z.string(),
  branch: z.string(),
  appPort: z.number(),
  subdomain: z.string(),
  directory: z.string(),
  pm2Name: z.string(),
  pr: z.number().nullable().optional(),
  deployedAt: z.string(),
  deployedBy: z.string(),
  lastUpdated: z.string().optional(),
  updatedBy: z.string().optional(),
});

const router: FastifyPluginAsyncZod = async (app, _opts) => {
  app.get('/deployments', {
    schema: {
      description: 'Get list of active feature deployments',
      tags: ['deployments'],
      response: {
        200: z.array(
          DeploymentSchema.pick({
            name: true,
            branch: true,
            appPort: true,
            subdomain: true,
            pr: true,
            deployedAt: true,
            deployedBy: true,
            lastUpdated: true,
          }),
        ),
      },
    },
    async handler(req, reply) {
      try {
        const deploymentsPath = join(
          process.cwd(),
          '../feature-deployment-mappings.json',
        );

        if (!existsSync(deploymentsPath)) {
          return [];
        }

        const deploymentsData = readFileSync(deploymentsPath, 'utf8');
        const deploymentsMap = JSON.parse(deploymentsData);

        // Convert to array and return public fields only
        const publicDeployments = Object.values(deploymentsMap)
          .filter((d: any) => d && d.name)
          .map((d: any) => ({
            name: d.name,
            branch: d.branch,
            appPort: d.appPort,
            subdomain: d.subdomain,
            pr: d.pr || null,
            deployedAt: d.deployedAt,
            deployedBy: d.deployedBy,
            lastUpdated: d.lastUpdated,
          }));

        return publicDeployments;
      } catch (error) {
        app.log.warn({ err: error }, 'Could not read deployments file:');
        return [];
      }
    },
  });

  app.get('/deployments/:name', {
    schema: {
      description: 'Get details of a specific deployment',
      tags: ['deployments'],
      params: z.object({
        name: z.string(),
      }),
      response: {
        200: DeploymentSchema.pick({
          name: true,
          branch: true,
          appPort: true,
          subdomain: true,
          pr: true,
          deployedAt: true,
          deployedBy: true,
          lastUpdated: true,
        }),
        404: z.object({
          error: z.string(),
        }),
      },
    },
    async handler(req, reply) {
      const { name } = req.params;

      try {
        const deploymentsPath = join(
          process.cwd(),
          '../feature-deployment-mappings.json',
        );

        if (!existsSync(deploymentsPath)) {
          reply.code(404);
          return { error: 'Deployment not found' };
        }

        const deploymentsData = readFileSync(deploymentsPath, 'utf8');
        const deploymentsMap = JSON.parse(deploymentsData);

        const deployment = Object.values(deploymentsMap).find(
          (d: any) => d && d.name === name,
        );

        if (!deployment) {
          reply.code(404);
          return { error: 'Deployment not found' };
        }

        return {
          name: (deployment as any).name,
          branch: (deployment as any).branch,
          appPort: (deployment as any).appPort,
          subdomain: (deployment as any).subdomain,
          pr: (deployment as any).pr || null,
          deployedAt: (deployment as any).deployedAt,
          deployedBy: (deployment as any).deployedBy,
          lastUpdated: (deployment as any).lastUpdated,
        };
      } catch (error) {
        app.log.warn({ err: error }, 'Could not read deployments file:');
        reply.code(404);
        return { error: 'Deployment not found' };
      }
    },
  });

  // Health check for deployment system
  app.get('/deployments/health', {
    schema: {
      description: 'Check deployment system health',
      tags: ['deployments'],
      response: {
        200: z.object({
          status: z.string(),
          deploymentsFile: z.boolean(),
          activeDeployments: z.number(),
          availablePorts: z.array(z.number()),
          availableSubdomains: z.array(z.string()),
          pm2Available: z.boolean(),
        }),
      },
    },
    async handler(req, reply) {
      const health = {
        status: 'ok',
        deploymentsFile: false,
        activeDeployments: 0,
        availablePorts: [] as number[],
        availableSubdomains: [] as string[],
        pm2Available: false,
      };

      try {
        // Check deployments file
        const deploymentsPath = join(
          process.cwd(),
          'deploy/config/deployments.json',
        );
        const deploymentsData = readFileSync(deploymentsPath, 'utf8');
        const deployments = JSON.parse(deploymentsData);
        health.deploymentsFile = true;
        health.activeDeployments = deployments.length;
      } catch (error) {
        app.log.warn({ err: error }, 'Could not read deployments file:');
      }

      // Check available ports (5003-5010)
      const usedPorts = new Set<number>();
      if (health.deploymentsFile) {
        try {
          const deploymentsPath = join(
            process.cwd(),
            'deploy/config/deployments.json',
          );
          const deploymentsData = readFileSync(deploymentsPath, 'utf8');
          const deployments = JSON.parse(deploymentsData);
          deployments.forEach((d: any) => usedPorts.add(d.appPort));
        } catch (error) {
          // Already logged above
        }
      }

      for (let port = 5003; port <= 5010; port++) {
        if (!usedPorts.has(port)) {
          health.availablePorts.push(port);
          // Convert port to subdomain
          const slot = port - 5000;
          const subdomain = slot < 10 ? `feature0${slot}` : `feature${slot}`;
          health.availableSubdomains.push(subdomain);
        }
      }

      // Check PM2 availability
      try {
        const { execSync } = await import('child_process');
        execSync('pm2 --version', { stdio: 'ignore' });
        health.pm2Available = true;
      } catch (error) {
        // PM2 not available
      }

      return health;
    },
  });

  // Feature mapping endpoint for frontend
  app.get('/feature-mapping.json', {
    schema: {
      description: 'Get branch to backend URL mapping for frontend',
      tags: ['deployments'],
      response: {
        200: z.record(z.string()),
      },
    },
    async handler(req, reply) {
      // Cache for 5 minutes to reduce load
      reply.header('Cache-Control', 'public, max-age=300');
      reply.header('Access-Control-Allow-Origin', '*');
      reply.type('application/json');

      try {
        const mappingPath = join(
          process.cwd(),
          '../feature-deployment-mappings.json',
        );

        // Create file if it doesn't exist
        if (!existsSync(mappingPath)) {
          writeFileSync(mappingPath, '{}');
          app.log.info('Created feature-deployment-mappings.json');
        }

        const deploymentsData = readFileSync(mappingPath, 'utf8');
        const deployments = JSON.parse(deploymentsData);

        // Convert to frontend-friendly mapping: branch -> URL
        const mapping: Record<string, string> = {};
        Object.entries(deployments).forEach(
          ([branch, deployment]: [string, any]) => {
            if (deployment && deployment.url) {
              mapping[branch] = deployment.url;
            }
          },
        );

        return mapping;
      } catch (error) {
        app.log.warn(
          { err: error },
          'Could not read feature deployment mappings:',
        );
        return {};
      }
    },
  });
};

export default router;
