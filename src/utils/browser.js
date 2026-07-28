// Created a separate file for browser creation

import { chromium } from "playwright";
import { logger } from "./logger.js";

export async function createBrowser() {
  logger.info("Launching browser...");

  const browser = await chromium.launch({
    headless: false
  });

  const context = await browser.newContext({
    storageState: "auth-state.json"
  });

  const page = await context.newPage();

  logger.info("Browser created with saved authentication state.");

  return {
    browser,
    context,
    page
  };
}