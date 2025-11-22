import { describe, expect, it } from '@jest/globals';

import { DataNormalizer } from '../DataNormalizer';

describe('DataNormalizer Space Force extensions', () => {
  describe('normalizeNASADSNStatus', () => {
    it('transforms DSN telemetry into normalized items with metadata and tags', () => {
      const result = DataNormalizer.normalizeNASADSNStatus({
        time: 1_700_000_000,
        dishes: {
          '25': {
            name: 'DSS-25',
            site: 'Goldstone',
            act: 'Tracking Voyager 1',
            desc: 'Deep space telemetry pass',
            az: 180,
            el: 45,
            ws: 5,
            tgts: ['Voyager 1'],
            sigs: [
              {
                uid: 'sig-1',
                tgt: 'Voyager 1',
                dir: 'down',
                band: 'X',
                rate: 720_000,
                active: true,
                pwr: -130
              }
            ]
          }
        }
      });

      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item.source).toBe('NASA Deep Space Network');
      expect(item.priority).toBe('high');
      expect(item.tags).toEqual(expect.arrayContaining(['dsn', 'goldstone', 'downlink', 'x', 'voyager 1']));
      expect(item.metadata?.dishName).toBe('DSS-25');
      expect(item.metadata?.site).toBe('Goldstone');
      expect(item.metadata?.dataRate).toBe(720_000);
    });

    it('returns empty array when payload contains no dishes', () => {
      expect(DataNormalizer.normalizeNASADSNStatus({} as any)).toEqual([]);
    });
  });

  describe('normalizeSpaceLaunchRSS', () => {
    it('parses launch RSS entries and enriches tags/metadata', () => {
      const sample = {
        feed: {
          title: 'Spaceflight Launch Schedule',
          items: [
            {
              title: 'Falcon 9 Starlink 7-3 scrubbed at T-2 minutes',
              link: 'https://example.com/mission/starlink-7-3',
              pubDate: '2024-01-02T03:04:05Z',
              description: 'Launch from Cape Canaveral scrubbed due to weather. Starlink payload delayed.'
            }
          ]
        }
      };

      const items = DataNormalizer.normalizeSpaceLaunchRSS(sample);
      expect(items).toHaveLength(1);
      const [item] = items;
      expect(item.priority).toBe('critical');
      expect(item.tags).toEqual(expect.arrayContaining(['launch', 'space', 'countdown', 'anomaly', 'mission-critical']));
      expect(item.metadata?.vehicle).toMatch(/Falcon 9/i);
      expect(item.metadata?.launchSite).toMatch(/Cape Canaveral/i);
    });
  });
});