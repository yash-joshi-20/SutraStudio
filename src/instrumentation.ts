import { validateProductionStartupEnv } from "@/lib/config/env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      validateProductionStartupEnv();
    } catch (err) {
      if (process.env.NODE_ENV === "production") {
        throw err;
      }
    }
  }
}
