import { createWorkflow } from "../src/agent/workflow.js";
import { createBrowser } from "../src/utils/browser.js";

async function testWorkflow() {
  let browser;

  try {
    console.log("\n=== Starting Workflow Test ===\n");

    // 1. Create authenticated browser
    const session = await createBrowser();

    browser = session.browser;
    const page = session.page;

    // 2. Create/compile LangGraph workflow
    const graph = createWorkflow();

    // 3. Initial LangGraph state
    const initialState = {
      page,
      retryCount: 0,
      success: false,
      error: null
    };

    console.log("Running workflow...\n");

    // 4. Run:
    // START → contentGen → executor → END
    const result = await graph.invoke(initialState);

    // 5. See final state
    console.log("\n=== FINAL STATE ===");

    console.log({
      tweetContent: result.tweetContent,
      targetElement: result.targetElement,
      retryCount: result.retryCount,
      success: result.success,
      error: result.error
    });

    // Keep browser open briefly for inspection
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error("\nWorkflow test failed:");
    console.error(error);

  } finally {
    if (browser) {
      await browser.close();
      console.log("\nBrowser closed.");
    }
  }
}

testWorkflow();