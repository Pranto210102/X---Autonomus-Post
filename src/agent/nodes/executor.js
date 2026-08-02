// execute the browser action, such as filling in the tweet content and returning the target element for the next node

import { CONFIG } from "../../config/constants.js";
import { logger } from "../../utils/logger.js";

export async function executorNode(state) {
  logger.info("Executing browser actions...");

  const { page, tweetContent } = state;

  try {
    if (!page) {
      throw new Error("Playwright page is missing.");
    }

    if (!tweetContent?.trim()) {
      throw new Error("Tweet content is empty.");
    }

    // 1. Go to X home
    logger.info("Opening X home...");

    await page.goto("https://x.com/home", {
      waitUntil: "domcontentloaded",
      timeout: CONFIG.DEFAULT_TIMEOUT
    });

    // Give X a moment to perform auth-based redirects before checking page state.
    await page.waitForTimeout(1200);

    logger.info(`Current page URL: ${page.url()}`);
    logger.info(`Current page title: ${(await page.title().catch(() => "<unavailable>"))}`);

    const currentUrl = page.url();
    let currentPath = "";
    try {
      currentPath = new URL(currentUrl).pathname;
    } catch {
      currentPath = "";
    }

    const landingChecks = await Promise.all([
      page.getByText("Happening now").isVisible().catch(() => false),
      page.getByRole("link", { name: /Sign in/i }).isVisible().catch(() => false),
      currentUrl.includes("/i/flow/login"),
      currentPath === "/"
    ]);

    if (landingChecks.some(Boolean)) {
      throw new Error("UNAUTHENTICATED_X_SESSION: X opened the logged-out landing page instead of the authenticated home feed. Refresh X_AUTH_STATE with a current logged-in session.");
    }

    // 2. Find composer
    logger.info("Finding composer...");

    const composer = page.locator(CONFIG.FALLBACK_SELECTORS.composer);

    await composer.waitFor({
      state: "visible",
      timeout: CONFIG.DEFAULT_TIMEOUT
    });

    // 3. Fill content
    logger.info("Entering tweet content...");

    await composer.fill(tweetContent);

    // 4. Find Post button
    logger.info("Finding Post button...");

    const postButton = page.locator(CONFIG.FALLBACK_SELECTORS.post_button);

    await postButton.waitFor({
      state: "visible",
      timeout: CONFIG.DEFAULT_TIMEOUT
    });

    // Optional but useful
    if (!(await postButton.isEnabled())) {
      throw new Error("Post button is disabled.");
    }

    // 5. Click Post
    logger.info("Clicking Post button...");

    await postButton.click();

    logger.info("Post button clicked successfully.");

    return {
      targetElement: CONFIG.TARGETS.VERIFY,
      success: true,
      error: null
    };

  } catch (error) {
    logger.error("Executor failed", error);

    return {
      success: false,
      error: error.message
    };
  }
}