// PM2 Process Manager Configuration for Hostinger VPS & Cloud
module.exports = {
  apps: [
    {
      name: 'saverfrom',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        HOST: '0.0.0.0',
      },
    },
  ],
};
