export enum LeaderboardTimeframe {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Season = 'season',
}

export enum LeaderboardSort {
  TlmGainsTotal = 'tlm_gains_total',
  TotalNftPoints = 'total_nft_points',
  AvgToolChargeTime = 'avg_tool_charge_time',
  AvgChargeTime = 'avg_charge_time',
  AvgMiningPower = 'avg_mining_power',
  AvgNftPower = 'avg_nft_power',
  AvgToolMiningPower = 'avg_tool_mining_power',
  AvgToolNftPower = 'avg_tool_nft_power',
  LandsMinedOn = 'lands_mined_on',
  PlanetsMinedOn = 'planets_mined_on',
  UniqueToolsUsed = 'unique_tools_used',
}

export enum LeaderboardOrder {
  Asc = 1,
  Desc = -1,
}
