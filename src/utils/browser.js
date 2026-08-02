import { chromium } from "playwright";
import fs, { truncate } from "fs";
import path from "path";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

/**
 * Creates and initializes a Playwright browser, authenticated context, and active page.
 * 
 * @returns {Promise<{ browser: import('playwright').Browser, browserContext: import('playwright').BrowserContext, page: import('playwright').Page }>}
 */
export async function createBrowser() {
  logger.info("Initializing browser engine...");

  const authPath = path.resolve("auth-state.json");
  const authBase64 = process.env.X_AUTH_STATE;

  // 1. Fault-Tolerant Hydration: Reconstruct auth-state.json if missing
  if (!fs.existsSync(authPath) && authBase64) {
    try {
      logger.info("auth-state.json not found. Decoding X_AUTH_STATE from environment...");
      const decodedJson = Buffer.from(authBase64, "base64").toString("utf-8");
      
      // Validate JSON structural integrity before writing
      JSON.parse(decodedJson);
      
      fs.writeFileSync(authPath, decodedJson, "utf-8");
      logger.info("Successfully reconstructed auth-state.json on disk.");
    } catch (err) {
      logger.error("Failed to decode or parse X_AUTH_STATE. Proceeding unauthenticated.", err);
    }
  }

  // 2. Launch Chromium with flags optimized for Linux CI/CD and Windows stability
  const browser = await chromium.launch({
    headless: true, // Set to true for automated background execution / GitHub Actions
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-dev-shm-usage",
    ],
  });

  // 3. Conditionally attach storage state if file exists
  const contextOptions = fs.existsSync(authPath) ? { storageState: authPath } : {};

  // Naming context explicitly as 'browserContext' to prevent variable collision
  const browserContext = await browser.newContext(contextOptions);
  const page = await browserContext.newPage();

  logger.info("Browser session successfully instantiated.");

  return {
    browser,
    browserContext, // Renamed to eliminate collision with global/node 'context'
    page,
  };
}