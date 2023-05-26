export class ClearingSnapshotsError extends Error {
  constructor() {
    super(`Clearing the snapshots database failed.`);
  }
}
