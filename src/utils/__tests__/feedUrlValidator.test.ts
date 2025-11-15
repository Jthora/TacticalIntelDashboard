import { investigativeArticleHostnames, isValidFeedURL } from '../feedUrlValidator';

describe('feedUrlValidator', () => {
  it('allows URLs that clearly reference feeds', () => {
    expect(isValidFeedURL('https://example.com/rss.xml')).toBe(true);
  });

  it('rejects article URLs from unknown hosts by default', () => {
    expect(isValidFeedURL('https://unknown-investigations.example/2024/12/01/story')).toBe(false);
  });

  it('allows investigative article URLs when host is approved', () => {
    const investigativeHosts = investigativeArticleHostnames();
    expect(investigativeHosts.length).toBeGreaterThan(0);

    const host = investigativeHosts[0]!;
    const investigativeArticleUrl = `https://${host}/2024/12/01/investigation`; // Date pattern should normally be blocked

    expect(isValidFeedURL(investigativeArticleUrl)).toBe(true);
  });

  it('can enforce strict feed-only validation when requested', () => {
    const investigativeHosts = investigativeArticleHostnames();
    const host = investigativeHosts[0]!;
    const investigativeArticleUrl = `https://${host}/2024/12/01/investigation`;

    expect(
      isValidFeedURL(investigativeArticleUrl, { allowArticlePatternsForInvestigativeHosts: false })
    ).toBe(false);
  });
});
