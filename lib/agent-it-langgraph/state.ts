import { Annotation } from '@langchain/langgraph';
import type { SimilarTicket } from '@/lib/agent-it/types';

export const ClassificationAnnotation = Annotation.Root({
  // Inputs
  title: Annotation<string>,
  description: Annotation<string>,
  topK: Annotation<number>,
  namespace: Annotation<string>,
  startMs: Annotation<number>,

  // Intermediate
  queryText: Annotation<string | undefined>,
  queryVector: Annotation<number[] | undefined>,
  topMatches: Annotation<SimilarTicket[] | undefined>,
  confidence: Annotation<number | undefined>,
  shouldEscalate: Annotation<boolean | undefined>,

  // Output
  suggestedResolution: Annotation<string | undefined>,
  latencyMs: Annotation<number | undefined>,

  // Execution trace — accumulates one entry per node
  trace: Annotation<{ node: string; durationMs: number }[]>({
    reducer: (a, b) => [...a, ...b],
    default: () => [],
  }),
});

export type ClassificationState = typeof ClassificationAnnotation.State;
