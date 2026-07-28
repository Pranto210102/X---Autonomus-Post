// test separate file for agent work-flow

import { contentGenNode } from "../src/agent/nodes/contentGen.js";
import { createBrowser } from "../src/utils/browser.js";

// Test the contentGenNode node in isolation

async function test() {
  try {
    console.log("Testing content generation...\n");

    const state = {};

    const result = await contentGenNode(state);

    console.log("\n--- RESULT ---");
    console.log(result);

    console.log("\nTweet:");
    console.log(result.tweetContent);

    console.log("\nTarget:");
    console.log(result.targetElement);
  } catch (error) {
    console.error("Test failed:", error);
  }
}


// async function test() {
//   let browser;

//   try {
//     const session = await createBrowser();

//     browser = session.browser;
//     const page = session.page;

//     console.log("Opening X...");

//     await page.goto("https://x.com/home", {
//       waitUntil: "domcontentloaded"
//     });

//     console.log("Current URL:", page.url());

//     // Keep browser open for 10 seconds
//     await page.waitForTimeout(10000);

//   } catch (error) {
//     console.error("Browser test failed:", error);
//   } finally {
//     if (browser) {
//       await browser.close();
//     }
//   }
// }

test();