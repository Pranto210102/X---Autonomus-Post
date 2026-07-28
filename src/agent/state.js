import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({

  // Playwright page
  page: Annotation(),

  // Generated X post
  tweetContent: Annotation(),

  // UI element the agent currently wants
  targetElement: Annotation(),

  // Selector currently being tried
  activeSelector: Annotation(),

  // Number of recovery attempts
  retryCount: Annotation({
    reducer: (current, update) =>
      update !== undefined ? update : current,

    default: () => 0
  }),

  // Result of latest action
  success: Annotation(),

  // Latest error
  error: Annotation()
});