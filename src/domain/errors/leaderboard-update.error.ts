import { LeaderboardUpdate } from '../entities/leaderboard-update';

export class LeaderboardUpdateError extends Error {
  constructor(
    public readonly total: number,
    public readonly failedUpdates: LeaderboardUpdate[],
    public readonly reason?: Error
  ) {
    super(
      failedUpdates.length > 0
        ? `Partially updated leaderboard ${failedUpdates.length}/${total}`
        : `Updating ${total} leaderboard failed.`
    );
  }
}
