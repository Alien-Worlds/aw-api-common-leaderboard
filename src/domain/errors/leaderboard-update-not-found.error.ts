export class LeaderboardUpdateNotFoundError extends Error {
  constructor() {
    super(`Leaderboard update not found.`);
  }
}
