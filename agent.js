import { createWorkflow } from "./src/agent/workflow.js";
import { createBrowser } from "./src/utils/browser.js";

async function runAgent() {
  let browser;

  try {
    console.log("\n=== Starting Autonomous X Agent ===\n");

    const session = await createBrowser();
    browser = session.browser;

    const graph = createWorkflow();
    const initialState = {
      page: session.page,
      retryCount: 0,
      success: false,
      error: null,
    };

    console.log("Running workflow...\n");

    const result = await graph.invoke(initialState);

    console.log("\n=== FINAL STATE ===");
    console.log({
      tweetContent: result.tweetContent,
      targetElement: result.targetElement,
      retryCount: result.retryCount,
      success: result.success,
      error: result.error,
      isPosted: result.isPosted,
      lastError: result.lastError,
    });
  } catch (error) {
    console.error("\nAgent run failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
      console.log("\nBrowser closed.");
    }
  }
}

runAgent();