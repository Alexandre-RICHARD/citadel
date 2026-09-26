import { vi } from "vitest";

vi.stubEnv("LOCAL_PORT", process.env.LOCAL_PORT);
vi.stubEnv("LOCAL_ADDRESS", process.env.LOCAL_ADDRESS);
vi.stubEnv("CORS_ORIGIN", process.env.CORS_ORIGIN);
vi.stubEnv("DB_SQLITE_PATH", process.env.DB_SQLITE_PATH);
vi.stubEnv("JWT_SECRET_KEY", process.env.JWT_SECRET_KEY);
