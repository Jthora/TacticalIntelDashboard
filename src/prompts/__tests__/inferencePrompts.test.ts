import { renderInferencePrompt } from '../inferencePrompts';
import { IntelLLMPayload } from '../../hooks/useIntelLLMPayload';

const basePayload: IntelLLMPayload = {
  mission: {
    mode: 'intel',
    profileLabel: 'Intel Ops',
    selectedFeedList: 'list-alpha'
  },
  filters: {
    activeFilters: ['priority:high'],
    timeRange: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-02T00:00:00Z',
      label: 'Last 24h'
    },
    searchQuery: '',
    sortBy: { field: 'timestamp', direction: 'desc' }
  },
  feeds: {
    intel: [
      {
        id: 'f1',
        title: 'Node outage detected',
        created: '2025-01-01T00:00:00Z',
        classification: 'UNCLASS',
        priority: 'high',
        sources: ['SRC-A'],
        body: 'outage details',
        summary: 'Node outage'
      },
      {
        id: 'f2',
        title: 'Supply chain risk',
        created: '2025-01-01T01:00:00Z',
        classification: 'UNCLASS',
        priority: 'medium',
        sources: ['SRC-B'],
        body: 'delays expected',
        summary: 'Delays'
      }
    ],
    count: 2,
    total: 2
  },
  diagnostics: {
    summary: { success: 2, empty: 0, failed: 1 },
    entries: [
      { sourceId: 'SRC-A', sourceName: 'Source A', status: 'success', itemsFetched: 5, durationMs: 45 },
      { sourceId: 'SRC-C', sourceName: 'Source C', status: 'failed', itemsFetched: 0, durationMs: 120, error: 'timeout' }
    ]
  },
  alerts: {
    triggers: [
      { title: 'Intrusion detected', priority: 'high', keywords: ['intrusion', 'vpn'], source: 'sensor-1' }
    ],
    count: 1
  },
  timestamps: {
    lastUpdated: '2025-01-02T03:00:00Z',
    generatedAt: '2025-01-02T03:05:00Z'
  },
  limits: {
    maxFeeds: 50,
    maxAlerts: 10
  }
};

describe('renderInferencePrompt', () => {
  it('renders summary prompt with truncation note', () => {
    const prompt = renderInferencePrompt('summary', basePayload, {
      truncated: true,
      truncationNote: 'Payload trimmed to stay within size limits.'
    });

    expect(prompt).toMatchInlineSnapshot(`
{
  "system": "You summarize intelligence feeds concisely. Do not speculate. Use only provided data.",
  "user": "Mission mode: intel (Intel Ops). Selected list: list-alpha.\nTime window: Last 24h (2025-01-01T00:00:00Z to 2025-01-02T00:00:00Z). Feeds provided: 2. Payload trimmed to stay within size limits.\nTasks:\n- Provide 3-7 bullet insights.\n- Reference sources or tags when possible.\n- Mention if data was truncated.\nData:\n- [source: SRC-A][priority: high] title: Node outage detected; summary: Node outage\n- [source: SRC-B][priority: medium] title: Supply chain risk; summary: Delays",
}
`);
  });

  it('renders risk prompt with alerts', () => {
    const prompt = renderInferencePrompt('risk', basePayload, {});

    expect(prompt).toMatchInlineSnapshot(`
{
  "system": "You identify risks, threats, and alerts from the provided feeds. Do not invent sources.",
  "user": "Mission mode: intel. Time window: Last 24h (2025-01-01T00:00:00Z to 2025-01-02T00:00:00Z). Feeds: 2. Alerts included: 1. No truncation applied.\nTasks:\n- List top risks/threats (bullets).\n- Summarize recent alerts and matched keywords.\n- Suggest one mitigation/next step if any risk is present.\nData:\n- [priority: high][keywords: intrusion,vpn][source: sensor-1] Intrusion detected\n- [source: SRC-A][priority: high] title: Node outage detected; summary: Node outage\n- [source: SRC-B][priority: medium] title: Supply chain risk; summary: Delays",
}
`);
  });

  it('renders source health prompt with diagnostics fallback when no entries', () => {
    const payload: IntelLLMPayload = {
      ...basePayload,
      diagnostics: {
        summary: { success: 0, empty: 1, failed: 0 },
        entries: []
      }
    };

    const prompt = renderInferencePrompt('sourceHealth', payload, {});

    expect(prompt).toMatchInlineSnapshot(`
{
  "system": "You summarize source health and propose simple remediation actions.",
  "user": "Diagnostics summary: success=0, empty=1, failed=0. No truncation applied.\nTasks:\n- State which sources failed or are empty.\n- Include latency/errors if given.\n- Suggest a concise action (retry, disable, proxy) if failures exist.\nData:\n- Diagnostics indicate sources are healthy.",
}
`);
  });

  it('renders fallback when feeds missing', () => {
    const payload: IntelLLMPayload = {
      ...basePayload,
      feeds: { intel: [], count: 0, total: 0 }
    };

    const prompt = renderInferencePrompt('summary', payload, {});

    expect(prompt.user).toContain('No feed data available; do not fabricate insights.');
  });
});
