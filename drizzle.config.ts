// drizzle.config.ts
export default {
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
      url: process.env.DATABASE_URL as string,
    },
  };