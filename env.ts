import fs from "fs";
import path from "path";
import dotenv from "dotenv";

let envLoaded = false;

export function loadEnvironment() {
  if (envLoaded) return;

  const root = process.cwd();
  const envPath = path.join(root, ".env");
  const localPath = path.join(root, ".env.local");

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  if (fs.existsSync(localPath)) {
    dotenv.config({ path: localPath, override: true });
  }

  envLoaded = true;
}

loadEnvironment();