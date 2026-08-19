/** ESLint config riêng cho apps/admin, kế thừa cấu hình chung của monorepo (packages/config/eslint.base.cjs). */
module.exports = {
  root: true,
  extends: ["../../packages/config/eslint.base.cjs"],
  env: { browser: true, es2022: true },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname
  },
  plugins: ["react-hooks", "react-refresh"],
  settings: { react: { version: "detect" } },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
  },
  ignorePatterns: ["dist", "node_modules", "*.config.ts", "*.config.js"]
};
