import { DataNormalizer } from '../DataNormalizer';

describe('DataNormalizer.normalizeOpenSecretsNews', () => {
  const sampleHTML = `
    <div class="news-item">
      <span class="date">Oct 03, 2025</span>
      <div class="labels">
        <span class="label">Campaign Finance</span>
      </div>
      <h3><a href="/news/dark-money-network-expands/">Dark money network expands</a></h3>
      <p class="teaser">Investigators uncover a fresh wave of shell companies channeling funds into federal contests.</p>
    </div>
    <div class="news-item">
      <span class="date">Sep 28, 2025</span>
      <h3><a href="https://www.opensecrets.org/news/independent-spending-record">Independent spending hits new record</a></h3>
      <p class="teaser">Record-setting outside spending reshapes battleground states.</p>
      <span class="badge">Spending</span>
    </div>
  `;

  it('parses OpenSecrets HTML cards into normalized items', () => {
    const results = DataNormalizer.normalizeOpenSecretsNews({ contents: sampleHTML });
    expect(results).toHaveLength(2);

    const first = results[0];
    expect(first.source).toBe('OpenSecrets Investigations');
    expect(first.category).toBe('financial-transparency');
    expect(first.tags).toEqual(expect.arrayContaining(['financial', 'transparency', 'opensecrets', 'campaign finance']));
    expect(first.url).toBe('https://www.opensecrets.org/news/dark-money-network-expands/');
    expect(first.priority).toBe('high');
    expect(first.metadata?.raw?.dateText).toBe('Oct 03, 2025');

    const second = results[1];
    expect(second.url).toBe('https://www.opensecrets.org/news/independent-spending-record');
    expect(second.tags).toEqual(expect.arrayContaining(['spending']));
    expect(second.priority).toBe('medium');
  });

  it('returns empty array when HTML is missing', () => {
    expect(DataNormalizer.normalizeOpenSecretsNews(undefined)).toEqual([]);
  });
});
