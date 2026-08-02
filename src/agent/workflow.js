import {
  StateGraph,
  START,
  END
} from "@langchain/langgraph";

import { CONFIG } from "../config/constants.js";
import { AgentState } from "./state.js";
import { contentGenNode } from "./nodes/contentGen.js";
import { executorNode } from "./nodes/executor.js";
import { validatorNode } from "./nodes/validetor.js"; 
import { domRecoveryNode } from "./nodes/domRecovary.js"; 
import { emailNotifierNode } from "./nodes/emailNotifier.js";

export function createWorkflow() {
  return new StateGraph(AgentState)
    // 1. Register all nodes in the state graph
    .addNode("contentGen", contentGenNode)
    .addNode("executor", executorNode)
    .addNode("validation", validatorNode)
    .addNode("domRecovery", domRecoveryNode)
    .addNode("emailNotifier", emailNotifierNode)

    // 2. Deterministic pipeline edges
    .addEdge(START, "contentGen")
    .addEdge("contentGen", "executor")
    .addEdge("executor", "validation")

    // 3. Dynamic conditional routing from validation node
    .addConditionalEdges(
      "validation",
      (state) => {
        // Case A: Tweet verified successfully -> Route to email report
        if (state.isPosted === true) {
          return "emailNotifier";
        }

        if (typeof state.lastError === "string" && /logged-out landing page|Refresh X_AUTH_STATE/i.test(state.lastError)) {
          return "emailNotifier";
        }

        // Case B: Exhausted retry budget -> Route to failure email report
        if (state.retryCount >= CONFIG.MAX_RETRIES) {
          return "emailNotifier";
        }

        // Case C: Recoverable failure -> Trigger vision inspection
        return "domRecovery";
      },
      // Explicit Mapping Dictionary 
      {
        "emailNotifier": "emailNotifier",
        "domRecovery": "domRecovery"
      }
    )

    // 4. Recovery loop edge
    .addEdge("domRecovery", "executor")

    // 5. Terminal edge: emailNotifier is now the exclusive sink node to END
    .addEdge("emailNotifier", END)

    .compile();
}