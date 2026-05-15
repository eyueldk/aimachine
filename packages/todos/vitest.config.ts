import path from "path";
import dotenv from "dotenv";
import { defineConfig } from "vitest/config";

dotenv.config({ 
  path: path.resolve(__dirname, "../../.env") 
});

export default defineConfig({
  test: {
    env: process.env,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
