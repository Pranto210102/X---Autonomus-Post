import { Annotation } from "@langchain/langgraph";

export const AgentState = Annotation.Root({

  // Playwright page instance
  page: Annotation(),

  // Generated X post
  tweetContent: Annotation(),

  // Current objective
  targetElement: Annotation(),

  // Selector currently being used
  activeSelector: Annotation(),

  // css | xpath
  selectorType: Annotation(),

  // DOM recovery status
  recovered: Annotation(),

  // Final validation status
  isPosted: Annotation(),

  // Retry count
  retryCount: Annotation({
    reducer: (current, update) =>
      update !== undefined ? update : current,

    default: () => 0
  }),

  // Latest node execution status
  success: Annotation(),

  // Latest error message
  error: Annotation()
});