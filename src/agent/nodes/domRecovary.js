import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { logger } from "../../utils/logger.js";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function domRecoveryNode(state) {
  logger.warn(`[DOM Recovery] Initiating visual/DOM inspection for step: "${state.targetElement}" (Attempt ${state.retryCount + 1})...`);
  const page = state.page;

  // Capture visual context
  const screenshotBuffer = await page.screenshot({ type: "jpeg", quality: 60 });
  const base64Image = screenshotBuffer.toString("base64");

  // Capture structural context (simplified DOM)
  const domSnapshot = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('button, div[role="textbox"], div[role="button"], textarea'));
    return elements.map(el => ({
      tagName: el.tagName,
      role: el.getAttribute('role'),
      testId: el.getAttribute('data-testid'),
      ariaLabel: el.getAttribute('aria-label'),
      innerText: el.innerText ? el.innerText.slice(0, 40) : ''
    }));
  });

  const prompt = `
    You are an expert Web Automation Recovery System inspecting X.com (Twitter).
    The automation script failed to interact with the "${state.targetElement}" element.
    Error Context: ${state.lastError}

    Simplified Interactive Elements DOM Tree:
    ${JSON.stringify(domSnapshot, null, 2)}

    Analyze the screenshot and DOM structure. Return a JSON object with a robust, valid CSS selector or XPath to target the required element.
    Schema format:
    {
      "selector": "string",
      "reasoning": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]}
      ],
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text);
    logger.info(`[DOM Recovery] Gemini proposed new selector: ${result.selector} (Reason: ${result.reasoning})`);

    return {
      activeSelector: result.selector,
      retryCount: state.retryCount + 1,
      lastError: null
    };
  } catch (err) {
    logger.error("[DOM Recovery] Vision analysis failed", err);
    return {
      retryCount: state.retryCount + 1,
      lastError: `DOM Recovery Failure: ${err.message}`
    };
  }
}