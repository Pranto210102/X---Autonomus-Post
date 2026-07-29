import { CONFIG } from "../../config/constants.js";
import { logger } from "../../utils/logger.js";

export async function validatorNode(state) {
  logger.info("Executing Validation Inspector Node...");
  const page = state.page;

  try {
    // Wait for network response/DOM update confirming post placement
    await page.waitForTimeout(4000);
    
    // Check if composer has closed or post appears
    const composerVisible = await page.isVisible(CONFIG.FALLBACK_SELECTORS.composer).catch(() => false);
    
    if (!composerVisible) {
      logger.info("Validation confirmed: Tweet posted successfully!");
      return { isPosted: true, lastError: null };
    } else {
      throw new Error("Composer interface still visible after post submission.");
    }
  } catch (err) {
    logger.warn(`Validation failed: ${err.message}`);
    return { lastError: err.message };
  }
}