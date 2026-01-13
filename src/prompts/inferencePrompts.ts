import { IntelLLMPayload } from '../hooks/useIntelLLMPayload';
import { InferenceFeature } from '../types/InferenceTypes';

export interface RenderPromptOptions {
  truncated?: boolean;
  truncationNote?: string;
}

export interface RenderedPrompt {
  system: string;
  user: string;
}

const formatTimeRange = (payload: IntelLLMPayload): string => {
  if (payload.filters.timeRange) {
    const { label, start, end } = payload.filters.timeRange;
    return `${label} (${start} to ${end})`;
  }
  if (payload.timestamps.lastUpdated) {
    return `Last updated at ${payload.timestamps.lastUpdated}`;
  }
  return 'Time window not specified';
};

const buildFeedsBlock = (payload: IntelLLMPayload): string => {
  if (!payload.feeds.intel.length) {
    return '- No feed data available; do not fabricate insights.';
  }
  return payload.feeds.intel
    .map(record => {
      const metaParts: string[] = [];
      if (record.sources?.length) metaParts.push(`source: ${record.sources.join(',')}`);
      if ((record as any).priority) metaParts.push(`priority: ${(record as any).priority}`);
      if ((record as any).tags?.length) metaParts.push(`tags: ${(record as any).tags.join(',')}`);
      const meta = metaParts.length ? `[${metaParts.join('][')}] ` : '';
      return `- ${meta}title: ${record.title}; summary: ${record.summary ?? ''}`;
    })
    .join('\n');
};

const buildAlertsBlock = (payload: IntelLLMPayload): string => {
  if (!payload.alerts.triggers.length) {
    return '- No alerts provided; skip alert recap.';
  }
  return payload.alerts.triggers
    .map((alert: any) => {
      const priority = alert.priority ? `[priority: ${alert.priority}]` : '';
      const keywords = alert.keywords?.length ? `[keywords: ${alert.keywords.join(',')}]` : '';
      const source = alert.source ? `[source: ${alert.source}]` : '';
      return `- ${priority}${keywords}${source} ${alert.title ?? ''}`.trim();
    })
    .join('\n');
};

const buildDiagnosticsBlock = (payload: IntelLLMPayload): string => {
  if (!payload.diagnostics.entries.length) {
    return '- Diagnostics indicate sources are healthy.';
  }
  return payload.diagnostics.entries
    .map(entry => {
      const latency = entry.durationMs ? `, latency=${entry.durationMs}ms` : '';
      const error = entry.error ? `, error=${entry.error}` : '';
      return `- ${entry.sourceName ?? entry.sourceId ?? 'unknown'} (status=${entry.status}, items=${entry.itemsFetched ?? 0}${latency}${error})`;
    })
    .join('\n');
};

const truncationSentence = (options: RenderPromptOptions): string => {
  if (options.truncated || options.truncationNote) {
    return options.truncationNote ?? 'Payload trimmed to stay within size limits.';
  }
  return 'No truncation applied.';
};

export const renderInferencePrompt = (
  feature: InferenceFeature,
  payload: IntelLLMPayload,
  options: RenderPromptOptions = {}
): RenderedPrompt => {
  const timeRange = formatTimeRange(payload);
  const truncatedNote = truncationSentence(options);

  if (feature === 'summary') {
    return {
      system: 'You summarize intelligence feeds concisely. Do not speculate. Use only provided data.',
      user: [
        `Mission mode: ${payload.mission.mode} (${payload.mission.profileLabel}). Selected list: ${payload.mission.selectedFeedList ?? 'none'}.`,
        `Time window: ${timeRange}. Feeds provided: ${payload.feeds.count}. ${truncatedNote}`,
        'Tasks:',
        '- Provide 3-7 bullet insights.',
        '- Reference sources or tags when possible.',
        '- Mention if data was truncated.',
        'Data:',
        buildFeedsBlock(payload)
      ].join('\n')
    };
  }

  if (feature === 'risk') {
    return {
      system: 'You identify risks, threats, and alerts from the provided feeds. Do not invent sources.',
      user: [
        `Mission mode: ${payload.mission.mode}. Time window: ${timeRange}. Feeds: ${payload.feeds.count}. Alerts included: ${payload.alerts.count}. ${truncatedNote}`,
        'Tasks:',
        '- List top risks/threats (bullets).',
        '- Summarize recent alerts and matched keywords.',
        '- Suggest one mitigation/next step if any risk is present.',
        'Data:',
        buildAlertsBlock(payload),
        buildFeedsBlock(payload)
      ].join('\n')
    };
  }

  return {
    system: 'You summarize source health and propose simple remediation actions.',
    user: [
      `Diagnostics summary: success=${payload.diagnostics.summary.success}, empty=${payload.diagnostics.summary.empty}, failed=${payload.diagnostics.summary.failed}. ${truncatedNote}`,
      'Tasks:',
      '- State which sources failed or are empty.',
      '- Include latency/errors if given.',
      '- Suggest a concise action (retry, disable, proxy) if failures exist.',
      'Data:',
      buildDiagnosticsBlock(payload)
    ].join('\n')
  };
};

export default renderInferencePrompt;
