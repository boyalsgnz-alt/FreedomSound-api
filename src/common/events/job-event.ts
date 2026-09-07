export const JOB_EVENT = 'job.status';

export const JobName = {
  SynchronizeArtists: 'synchronize-artists',
  AddLocalFiles: 'add-local-files',
  UpsertTracks: 'upsert-tracks',
  UpdateTracks: 'update-tracks',
} as const;

export type JobName = (typeof JobName)[keyof typeof JobName];

export type JobStatus = 'started' | 'completed' | 'failed';

export interface JobEvent {
  job: JobName;
  status: JobStatus;
  message?: string;
}
