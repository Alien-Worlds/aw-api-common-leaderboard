export class ClearingRedisError extends Error {
  constructor() {
    super(`Clearing the redis database failed.`);
  }
}
