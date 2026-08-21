module.exports = {
  apps: [
    {
      name: 'elecio_co',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 8568',
      cwd: __dirname,
      exec_mode: 'fork',
      watch: false,
      output: './logs/out.log',
      error: './logs/error.log',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
