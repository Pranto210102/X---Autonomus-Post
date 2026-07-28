import { executorNode } from "../src/agent/nodes/executor.js";
import { contentGenNode } from "../src/agent/nodes/contentGen.js";
import { createBrowser } from "../src/utils/browser.js";

async function test() {
  let browser;

  try {
    console.log("1. Generating content...");

    const generated = await contentGenNode({});

    console.log("Generated:");
    console.log(generated.tweetContent);

    console.log("\n2. Opening browser...");

    const session = await createBrowser();

    browser = session.browser;
    const page = session.page;

    console.log("\n3. Opening X...");

    await page.goto("https://x.com/home", {
      waitUntil: "domcontentloaded"
    });

    console.log("\n4. Running executor...");

    const state = {
      page,
      tweetContent: generated.tweetContent,
      targetElement: generated.targetElement
    };

    const result = await executorNode(state);

    console.log("\nExecutor result:");
    console.log(result);

    // Keep browser open so you can inspect the composer.
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error("Executor test failed:", error);

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

test();