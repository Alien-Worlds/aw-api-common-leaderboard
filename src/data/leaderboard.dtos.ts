import { MongoDB } from '@alien-worlds/api-core';

export type LeaderboardUpdateDocument = {
  action_count?: number;
  wallet_id: string;
  block_number: MongoDB.Long;
  block_timestamp: Date;
  username?: string;
  bounty?: number;
  points?: number;
  ease?: number;
  luck?: number;
  difficulty?: number;
  delay?: number;
  land_id?: MongoDB.Long;
  planet_name?: string;
  bag_items?: MongoDB.Long[];
  update_id?: string;
  _id?: MongoDB.ObjectId;
  [key: string]: unknown;
};

export type LeaderboardUpdateJson = {
  action_count?: number;
  wallet_id?: string;
  block_number?: string;
  block_timestamp?: string;
  username?: string;
  bounty?: number;
  points?: number;
  ease?: number;
  luck?: number;
  difficulty?: number;
  delay?: number;
  land_id?: string;
  planet_name?: string;
  bag_items?: string[];
  update_id?: string;
  id?: string;
  [key: string]: unknown;
};

export type LeaderboardNumbers = {
  tlm_gains_total?: number;
  total_nft_points?: number;
  unique_tools_used?: number;
  avg_tool_charge_time?: number;
  avg_charge_time?: number;
  avg_mining_power?: number;
  avg_nft_power?: number;
  avg_tool_mining_power?: number;
  avg_tool_nft_power?: number;
  lands_mined_on?: number;
  planets_mined_on?: number;
};

export type LeaderboardDocument = LeaderboardNumbers & {
  action_count?: number;
  _id?: MongoDB.ObjectId;
  last_block_number?: MongoDB.Long;
  last_block_timestamp?: Date;
  last_update_timestamp?: Date;
  last_update_id?: string;
  wallet_id?: string;
  username?: string;
  tlm_gains_highest?: number;
  tools_used?: MongoDB.Long[];
  total_tool_charge_time?: number;
  total_charge_time?: number;
  total_mining_power?: number;
  total_nft_power?: number;
  total_tool_mining_power?: number;
  total_tool_nft_power?: number;
  lands?: MongoDB.Long[];
  planets?: string[];
  lands_mined_on?: number;
  planets_mined_on?: number;
  unique_tools_used?: number;
  rankings?: LeaderboardNumbers;
  [key: string]: unknown;
};

export type MinigToolData = {
  delay: number;
  ease: number;
  difficulty: number;
  luck: number;
};

export type LeaderboardJson = LeaderboardNumbers & {
  action_count?: number;
  last_block_number?: string;
  last_block_timestamp?: string;
  last_update_timestamp?: string;
  last_update_id?: string;
  last_update_completed?: boolean;
  wallet_id?: string;
  username?: string;
  tlm_gains_highest?: number;
  tools_used?: string[];
  total_tool_charge_time?: number;
  total_charge_time?: number;
  total_mining_power?: number;
  total_nft_power?: number;
  total_tool_mining_power?: number;
  total_tool_nft_power?: number;
  lands?: string[];
  planets?: string[];
  lands_mined_on?: number;
  planets_mined_on?: number;
  unique_tools_used?: number;
  rankings?: LeaderboardNumbers;
  [key: string]: unknown;
};

export type LeaderboardUserRankingsJson = { [key: string]: LeaderboardNumbers };
export type LeaderboardUserScoresJson = { [key: string]: LeaderboardNumbers };
