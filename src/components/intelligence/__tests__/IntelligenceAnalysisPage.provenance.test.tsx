import { render, screen, waitFor, within } from '@testing-library/react';

import IntelligenceAnalysisPage from '../IntelligenceAnalysisPage';
import { getIntelligenceItems } from '../../../web3/intelligence/intelligenceAnalysis';
import type { IntelligenceItem } from '../../../web3/intelligence/intelligenceAnalysis';
import { makeProvenanceFixture } from '../../../tests/provenanceFixtures';

type MockedGetItems = jest.MockedFunction<typeof getIntelligenceItems>;

jest.mock('../../../hooks/useWeb3', () => ({
  useWeb3: () => ({ provider: {}, isConnected: true })
}));

jest.mock('../../../web3/intelligence/intelligenceAnalysis', () => ({
  __esModule: true,
  getIntelligenceItems: jest.fn(),
  submitAnonymousIntelligence: jest.fn(),
  submitIntelligence: jest.fn(),
  voteOnIntelligence: jest.fn(),
  IntelAssessment: { UNCERTAIN: 0 }
}));

const mockItems: IntelligenceItem[] = [
  {
    id: 'intel-1',
    submitter: '0xabc',
    metadata: 'metadata-hash',
    confidenceScore: 82,
    voteCount: 7,
    timestamp: Date.now(),
    content: 'Infrastructure stability assessment',
    category: 'geopolitical',
    sensitivity: 'medium' as const,
    provenance: makeProvenanceFixture()
  }
];

describe('IntelligenceAnalysisPage provenance badges', () => {
  it('renders provenance badges for intelligence items in browse view', async () => {
    (getIntelligenceItems as MockedGetItems).mockResolvedValue(mockItems);

    render(<IntelligenceAnalysisPage />);

    await waitFor(() => {
      expect(getIntelligenceItems).toHaveBeenCalled();
    });

    const intelContent = await screen.findByText('Infrastructure stability assessment');
    const intelCard = intelContent.closest('.intel-item') as HTMLElement;

    const anchorBadge = within(intelCard).queryByTestId('prov-badge-anchor');
    const signatureBadge = within(intelCard).queryByTestId('prov-badge-signature');
    const relayBadge = within(intelCard).queryByTestId('prov-badge-relay');
    const cidBadge = within(intelCard).queryByTestId('prov-badge-cid');

    expect(anchorBadge).toBeTruthy();
    expect(signatureBadge).toHaveTextContent('Signed');
    expect(relayBadge).toHaveTextContent('Relayed');
    expect(cidBadge).toHaveTextContent('CID');

    await waitFor(() => {
      expect(within(intelCard).queryByTestId('prov-detail-panel')).toBeTruthy();
    });
  });
});
