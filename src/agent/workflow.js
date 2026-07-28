import {
  StateGraph,
  START,
  END
} from "@langchain/langgraph";

import { AgentState } from "./state.js";
import { contentGenNode } from "./nodes/contentGen.js";
import { executorNode } from "./nodes/executor.js";

export function createWorkflow() {
  return new StateGraph(AgentState)
    .addNode("contentGen", contentGenNode)
    .addNode("executor", executorNode)

    .addEdge(START, "contentGen")
    .addEdge("contentGen", "executor")
    .addEdge("executor", END)

    .compile();
}