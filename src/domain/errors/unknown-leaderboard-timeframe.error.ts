export class UnknownLeaderboardTimeframeError extends Error {
  constructor(timeframe: string) {
    super(`Unknonwn leaderboard timeframe "${timeframe}".`);
  }
}
