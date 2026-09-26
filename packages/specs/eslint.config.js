import { defineConfig } from "eslint/config";
import specsConfig from '@citadel/eslint-config/specs';

export default defineConfig([
  ...specsConfig,
]);
