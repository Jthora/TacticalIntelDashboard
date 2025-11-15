import { DataNormalizer } from '../DataNormalizer';

describe('DataNormalizer.normalizeTBIJInvestigations', () => {
  const sampleHTML = `
    <section class="tb-c-story-grid">
      <a class="tb-c-story-preview" href="/stories/2025-02-10/example-investigation">
        <div class="tb-c-story-preview__meta">
          <p class="tb-c-story-preview__meta-item">10.02.25</p>
          <p class="tb-c-story-preview__meta-item">Global Health</p>
          <p class="tb-c-story-preview__meta-item">Accountability</p>
        </div>
        <h2 class="tb-c-story-preview__heading">Secretive lab leaked dangerous pathogen</h2>
        <p class="tb-c-story-preview__body">Investigative reporters uncover the timeline of decisions that enabled the leak.</p>
        <figure class="tb-c-story-preview__image">
          <img class="tb-c-story-preview__image-img" src="https://cdn.thebureauinvestigates.com/images/example.jpg" />
        </figure>
      </a>
    </section>
  `;

  const sampleMarkdown = `
    [![Investigations](https://cdn.thebureauinvestigates.com/images/cover.jpg) 12.02.25 Global Health --- Lab oversight failure --- Investigators reveal oversight breakdown 7 minute read](https://www.thebureauinvestigates.com/stories/2025-02-12/markdown-followup)
  `;

  it('extracts normalized items from HTML story previews', () => {
    const results = DataNormalizer.normalizeTBIJInvestigations({ contents: sampleHTML });

    expect(results).toHaveLength(1);
    const item = results[0];
    expect(item.source).toBe('The Bureau of Investigative Journalism');
    expect(item.url).toBe('https://www.thebureauinvestigates.com/stories/2025-02-10/example-investigation');
    expect(item.title).toContain('Secretive lab');
    expect(item.summary).toContain('Investigative reporters uncover');
    expect(item.metadata?.thumbnail).toBe('https://cdn.thebureauinvestigates.com/images/example.jpg');
    expect(item.tags).toEqual(expect.arrayContaining(['investigative', 'tbij', 'global health', 'accountability']));
    expect(item.publishedAt).toBeInstanceOf(Date);
    expect(item.metadata?.categories).toEqual([
      '10.02.25',
      'Global Health',
      'Accountability'
    ]);
  });

  it('handles plain HTML string responses', () => {
    const results = DataNormalizer.normalizeTBIJInvestigations(sampleHTML);
    expect(results).toHaveLength(1);
  });

  it('normalizes markdown fallback entries with metadata parity', () => {
    const results = DataNormalizer.normalizeTBIJInvestigations(sampleMarkdown);
    expect(results).toHaveLength(1);

    const item = results[0];
    expect(item.url).toBe('https://www.thebureauinvestigates.com/stories/2025-02-12/markdown-followup');
    expect(item.metadata?.thumbnail).toBe('https://cdn.thebureauinvestigates.com/images/cover.jpg');
    expect(item.metadata?.categories).toEqual([
      '12.02.25',
      'Global Health'
    ]);
    expect(item.tags).toEqual(expect.arrayContaining(['tbij', 'global health']));
    expect(item.metadata?.raw?.readTime).toBe('7 minute read');
    expect(item.summary?.toLowerCase()).toContain('lab oversight failure');
  });

  it('returns empty array for unparseable responses', () => {
    expect(DataNormalizer.normalizeTBIJInvestigations(undefined)).toEqual([]);
    expect(DataNormalizer.normalizeTBIJInvestigations({})).toEqual([]);
  });
});
