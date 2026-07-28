// Generate content for the X.com post using Gemini API Key

import {GoogleGenAI} from "@google/genai";
import {logger} from "../../utils/logger.js";
import {CONFIG} from "../../config/constants.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


export async function contentGenNode(state) {
  logger.info("Executing Content Generation Node...");
  
  const prompt = `
    Write an engaging, insightful technical tweet about modern software engineering, web automation, or AI system design.
    Rules:
    - Keep it under 240 characters.
    - Don't use hashtags.
    - Do not use quotes around the output.
    - Return only the post text.
    - Avoid any promotional content.
    - Ensure the content is original and not copied from existing sources.
    - The content should be relevant to the latest trends in software engineering, web automation, or AI system design.
    - Avoid any references to specific companies or products.
    `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
    });

    const tweetText = response.text.trim();
    logger.info(`Generated Content: "${tweetText}"`);

    return {
      tweetContent: tweetText,
      targetElement: CONFIG.TARGETS.COMPOSER
    };
  } catch (err) {
    logger.error("Failed to generate content via Gemini API", err);
    throw err;
  }
}
