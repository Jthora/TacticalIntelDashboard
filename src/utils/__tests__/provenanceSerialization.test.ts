import { makeHybridProvenance, makeMissingCidProvenance, makePendingProvenance } from '../../tests/provenanceFixtures';
import { ProvenanceBundle } from '../../types/Provenance';
import { Feed } from '../../models/Feed';

const minimalFeed = (provenance?: ProvenanceBundle): Feed => ({
  id: 'feed-1',
  name: 'Example',
  url: 'https://example.com/rss',
  title: 'Example feed',
  link: 'https://example.com/item',
  pubDate: '2024-01-01T00:00:00Z',
  feedListId: 'list-1',
  ...(provenance ? { provenance } : {})
});

describe('provenance serialization', () => {
  it('round-trips a populated provenance bundle without loss', () => {
    const source = makeHybridProvenance();
    const roundTrip: ProvenanceBundle = JSON.parse(JSON.stringify(source));

    expect(roundTrip).toEqual(source);
    expect(roundTrip.signatures?.length).toBe(2);
    expect(roundTrip.chainRef?.status).toBe('confirmed');
    expect(roundTrip.provenanceVersion).toBeDefined();
  });

  it('retains optional fields when present and omits absent fields', () => {
    const source: ProvenanceBundle = makePendingProvenance();
    const roundTrip: ProvenanceBundle = JSON.parse(JSON.stringify(source));

    expect(roundTrip.anchorStatus).toBe('pending');
    expect(roundTrip.chainRef?.status).toBe('pending');
    expect(roundTrip.cid).toBeDefined();

    const minimal: ProvenanceBundle = { anchorStatus: 'not-requested' };
    const minimalRoundTrip = JSON.parse(JSON.stringify(minimal)) as ProvenanceBundle;
    expect(minimalRoundTrip.anchorStatus).toBe('not-requested');
    expect(minimalRoundTrip.cid).toBeUndefined();
    expect(minimalRoundTrip.chainRef).toBeUndefined();
  });

  it('round-trips a feed with provenance and keeps provenance fields intact', () => {
    const feed = minimalFeed(makeMissingCidProvenance());
    const roundTrip = JSON.parse(JSON.stringify(feed)) as Feed;

    expect(roundTrip.provenance?.anchorStatus).toBe('anchored');
    expect(roundTrip.provenance?.cid).toBe('');
    expect(roundTrip.provenance?.relayIds).toEqual(['relay-1']);
  });
});
