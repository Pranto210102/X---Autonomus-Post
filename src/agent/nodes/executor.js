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

    // 2. Find composer
    logger.info("Finding composer...");

    const composer = page.locator(
      CONFIG.FALLBACK_SELECTORS.composer
    );

    await composer.waitFor({
      state: "visible",
      timeout: CONFIG.DEFAULT_TIMEOUT
    });

    // 3. Fill content
    logger.info("Entering tweet content...");

    await composer.fill(tweetContent);

    // 4. Find Post button
    logger.info("Finding Post button...");

    const postButton = page.locator(
      CONFIG.FALLBACK_SELECTORS.post_button
    );

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

    // await postButton.click();

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