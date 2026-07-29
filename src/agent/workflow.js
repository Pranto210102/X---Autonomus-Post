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

export function createWorkflow() {
  return new StateGraph(AgentState)
    .addNode("contentGen", contentGenNode)
    .addNode("executor", executorNode)
    .addNode("validation", validatorNode)
    .addNode("domRecovery", domRecoveryNode)

    .addEdge(START, "contentGen")
    .addEdge("contentGen", "executor")
    .addEdge("executor", "validation")

    // Validator routing
    .addConditionalEdges(
      "validation",
      (state) => {
        // Tweet verified
        if (state.isPosted) {
          return END;
        }

        // Retry limit reached
        if (state.retryCount >= CONFIG.MAX_RETRIES) {
          return END;
        }

        // Recovery required
        return "domRecovery";
      }
    )
    .addEdge("domRecovery", "executor")

    .compile();
}