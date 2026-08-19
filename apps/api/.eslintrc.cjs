/** ESLint config riêng cho apps/api, kế thừa cấu hình chung của monorepo (packages/config/eslint.base.cjs). */
module.exports = {
  root: true,
  extends: ["../../packages/config/eslint.base.cjs"],
  env: { node: true, es2022: true, jest: true },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  },
  rules: {
    // NestJS dùng decorator + DI theo convention riêng, tắt vài rule dễ gây false-positive.
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
  },
  ignorePatterns: ["dist", "node_modules", "*.config.js", "test/**/*.ts"]
};
