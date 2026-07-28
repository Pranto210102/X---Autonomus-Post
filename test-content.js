// test separate file for agent work-flow

import { contentGenNode } from "./src/agent/nodes/contentGen.js";

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

test();