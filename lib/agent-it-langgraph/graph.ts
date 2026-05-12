import { StateGraph, START, END } from '@langchain/langgraph';
import { ClassificationAnnotation } from './state';
import {
  formatQueryNode,
  embedQueryNode,
  searchSimilarNode,
  evaluateConfidenceNode,
  escalateNode,
  generateResolutionNode,
  formatResponseNode,
} from './nodes';

const graph = new StateGraph(ClassificationAnnotation)
  .addNode('formatQuery', formatQueryNode)
  .addNode('embedQuery', embedQueryNode)
  .addNode('searchSimilar', searchSimilarNode)
  .addNode('evaluateConfidence', evaluateConfidenceNode)
  .addNode('escalate', escalateNode)
  .addNode('generateResolution', generateResolutionNode)
  .addNode('formatResponse', formatResponseNode)
  .addEdge(START, 'formatQuery')
  .addEdge('formatQuery', 'embedQuery')
  .addEdge('embedQuery', 'searchSimilar')
  .addEdge('searchSimilar', 'evaluateConfidence')
  .addConditionalEdges(
    'evaluateConfidence',
    (state) => state.shouldEscalate ? 'escalate' : 'generateResolution',
    { escalate: 'escalate', generateResolution: 'generateResolution' }
  )
  .addEdge('escalate', 'formatResponse')
  .addEdge('generateResolution', 'formatResponse')
  .addEdge('formatResponse', END);

export const classificationGraph = graph.compile();
