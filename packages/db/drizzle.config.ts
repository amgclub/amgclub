import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: process.env.ENV_FILE || "../../apps/admin/.env" });

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
		ssl: "require",
	},
});
