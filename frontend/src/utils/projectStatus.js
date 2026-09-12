export const STATUS_STEPS = ['PENDING', 'CLONING', 'PARSING', 'ANALYZING_DEPENDENCIES', 'COMPLETED'];

export const STATUS_LABELS = {
  PENDING: 'Queued',
  CLONING: 'Cloning repository',
  PARSING: 'Parsing Java files',
  ANALYZING_DEPENDENCIES: 'Analyzing dependencies',
  COMPLETED: 'Completed',
  FAILED: 'Analysis failed',
};

export const isInProgress = (status) =>
  ['PENDING', 'CLONING', 'PARSING', 'ANALYZING_DEPENDENCIES'].includes(status);

