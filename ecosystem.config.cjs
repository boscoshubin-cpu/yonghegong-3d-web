'use strict';

module.exports = {
  apps: [
    {
      name: 'yonghegong-3d-web',
      script: './server.cjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 18766
      }
    }
  ]
};
