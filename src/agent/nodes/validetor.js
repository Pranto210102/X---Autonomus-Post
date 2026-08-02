import { CONFIG } from "../../config/constants.js";
import { logger } from "../../utils/logger.js";

export async function validatorNode(state) {
  logger.info("Executing Validation Inspector Node...");
  const page = state.page;

  try {
    // Wait for the UI to settle before checking for the published tweet.
    await page.waitForTimeout(4000);

    const tweetContent = state.tweetContent?.trim();
    const composerVisible = await page.isVisible(CONFIG.FALLBACK_SELECTORS.composer).catch(() => false);
    const publishedTweetCount = tweetContent
      ? await page.locator(CONFIG.FALLBACK_SELECTORS.timeline_tweet)
          .filter({ hasText: tweetContent })
          .count()
      : 0;
    
    if (publishedTweetCount > 0) {
      logger.info("Validation confirmed: Tweet posted successfully!");
      return { isPosted: true, lastError: null };
    } else {
      throw new Error(
        composerVisible
          ? "No published tweet matching the generated content was found."
          : "Composer closed, but no published tweet matching the generated content was found."
      );
    }
  } catch (err) {
    logger.warn(`Validation failed: ${err.message}`);
    return { isPosted: false, lastError: err.message };
  }
}