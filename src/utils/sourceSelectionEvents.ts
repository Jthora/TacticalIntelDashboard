export const SOURCE_SELECTION_RESET_EVENT = 'mission:source-selection-reset' as const;

export type SourceSelectionResetReason = 'invalid' | 'disabled' | 'restored';

export interface SourceSelectionResetDetail {
  reason: SourceSelectionResetReason;
  sourceId?: string;
  sourceName?: string;
}

export const emitSourceSelectionReset = (detail: SourceSelectionResetDetail): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<SourceSelectionResetDetail>(SOURCE_SELECTION_RESET_EVENT, {
      detail
    })
  );
};
