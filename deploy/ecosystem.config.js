/**
 * Cấu hình PM2 cho apps/api trên Windows Server (production/staging).
 * Chạy: pm2 start deploy/ecosystem.config.js --env production
 * Reload không downtime: pm2 reload ecosystem.config.js --update-env
 *
 * apps/web và apps/admin là site tĩnh (Vite build ra HTML/JS/CSS) nên KHÔNG cần PM2 —
 * IIS serve trực tiếp từ thư mục build (xem deploy/iis/web.config.web và web.config.admin).
 */
module.exports = {
  apps: [
    {
      name: "congdoan-api",
      cwd: __dirname + "/../apps/api",
      script: "dist/main.js",
      instances: 1, // tăng lên "max" (cluster mode) nếu cần scale theo số CPU khi tải cao
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      },
      env_staging: {
        NODE_ENV: "staging"
      },
      // Biến môi trường thật (DATABASE_URL, JWT_*, REDIS_URL...) đặt trong file .env cạnh
      // dist/main.js trên server, KHÔNG commit vào git — xem .env.example ở root repo.
      out_file: "../../logs/api-out.log",
      error_file: "../../logs/api-error.log",
      time: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};
