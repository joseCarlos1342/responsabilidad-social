import generatedResults from './financial-results.generated.json';

export type DiagnosticOption = {
  label: string;
  count: number;
  percentage: number;
};

export type DiagnosticQuestion = {
  question: string;
  options: readonly DiagnosticOption[];
};

/** Consolidado agregado generado desde el XLSX durante el build. */
export const financialResults = generatedResults;

export const diagnosticSummary = {
  ...financialResults.initial,
  hasPosteriorEvaluation: true,
  paired: false,
};
