module.exports = {
  apps: [
    // Production app
    {
      name: 'aisales',
      cwd: '/home/aicoaching/aisales/aisales-backend',
      script: './dist/server.js',
      watch: false,
      exec_mode: 'cluster_mode',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      env: {
        PORT: 5001,
        NODE_ENV: 'production',
      },
      env_production: {
        PORT: 5001,
        NODE_ENV: 'production',
      },
      error_file: '/home/aicoaching/.pm2/logs/aisales-error.log',
      out_file: '/home/aicoaching/.pm2/logs/aisales-out.log',
      pid_file: '/home/aicoaching/.pm2/pids/aisales.pid',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
    // Staging app
    {
      name: 'aisales-staging',
      cwd: '/home/aicoaching/aisales/aisales-backend-staging',
      script: './dist/server.js',
      watch: false,
      exec_mode: 'fork', // Using fork mode for staging to avoid port conflicts
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      env: {
        PORT: 5002,
        NODE_ENV: 'staging',
      },
      env_staging: {
        PORT: 5002,
        NODE_ENV: 'staging',
      },
      error_file: '/home/aicoaching/.pm2/logs/aisales-staging-error.log',
      out_file: '/home/aicoaching/.pm2/logs/aisales-staging-out.log',
      pid_file: '/home/aicoaching/.pm2/pids/aisales-staging.pid',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
    },
  ],
  pm2: {
    log: '/home/aicoaching/.pm2/logs/aisales-pm2.log',
    pid: '/home/aicoaching/.pm2/aisales-pm2.pid',
  },
};
