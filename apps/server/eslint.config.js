import { defineConfig } from "eslint/config";
import serverConfig from '@citadel/eslint-config/server';

export default defineConfig([
  ...serverConfig,
]);
