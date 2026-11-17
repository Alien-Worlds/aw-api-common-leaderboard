import 'reflect-metadata';

import { LeaderboardUpdate, LogmineRawModel } from '../leaderboard-update';

describe('LeaderboardUpdate.fromLogmineJson', () => {
  const logmine: LogmineRawModel = {
    miner: 'miner.wam',
    params: { invalid: 0, delay: 360, difficulty: 3, ease: 20, luck: 150 },
    bounty: '12.3456 TLM',
    land_id: 1099511627776,
    planet_name: 'eyeke.world',
    bag_items: [1099511627776, 1099511627777],
  };

  it('maps the logmine fields onto the update', () => {
    const update = LeaderboardUpdate.fromLogmineJson(
      100,
      new Date('2024-03-15T12:00:00.000Z'),
      logmine
    );
    const json = update.toJson();

    expect(json.wallet_id).toBe('miner.wam');
    expect(json.planet_name).toBe('eyeke.world');
    expect(json.ease).toBe(20);
    expect(json.luck).toBe(150);
    expect(json.difficulty).toBe(3);
    expect(json.delay).toBe(360);
    expect(json.points).toBe(150);
  });

  it('parses the bounty out of the asset string using the decimal precision', () => {
    const at4 = LeaderboardUpdate.fromLogmineJson(
      1,
      new Date(),
      logmine,
      4
    ).toJson();
    const at2 = LeaderboardUpdate.fromLogmineJson(
      1,
      new Date(),
      logmine,
      2
    ).toJson();

    expect(Number(at4.bounty)).toBe(123456);
    expect(Number(at2.bounty)).toBe(1235);
  });

  it('treats a missing bounty as zero', () => {
    const { bounty, ...withoutBounty } = logmine;
    expect(bounty).toBeDefined();

    const json = LeaderboardUpdate.fromLogmineJson(
      1,
      new Date(),
      withoutBounty
    ).toJson();

    expect(Number(json.bounty)).toBe(0);
  });

  it('accepts the extra fields a real logmine action carries', () => {
    const real: LogmineRawModel = {
      ...logmine,
      landowner: 'owner.wam',
      offset: 3,
      landowner_share: '1.0000 TLM',
      pool_amounts: [{ key: 'eyeke.world', value: '2.0000 TLM' }],
    };

    expect(() =>
      LeaderboardUpdate.fromLogmineJson(1, new Date(), real)
    ).not.toThrow();
  });
});
