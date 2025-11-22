import { Feed } from '../models/Feed';

export interface IntelExportOptions {
  limit?: number;
}

const truncateFeeds = (feeds: Feed[], limit?: number) =>
  typeof limit === 'number' ? feeds.slice(0, limit) : feeds;

export const exportFeedsAsIntelZip = (
  feeds: Feed[],
  options: IntelExportOptions = {}
): void => {
  const payload = truncateFeeds(feeds, options.limit);
  console.info('Intel ZIP export requested', {
    itemCount: payload.length,
    options
  });
};

export const exportIntelReport = (
  feeds: Feed[],
  options: IntelExportOptions = {}
): void => {
  const payload = truncateFeeds(feeds, options.limit);
  console.info('Intel report export requested', {
    itemCount: payload.length,
    options
  });
};
