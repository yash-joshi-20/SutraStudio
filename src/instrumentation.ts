import { validateProductionStartupEnv } from "@/lib/config/env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      validateProductionStartupEnv();
    } catch (err: any) {
      console.warn("[Instrumentation Startup Notice]", err?.message || err);
    }
  }
}

