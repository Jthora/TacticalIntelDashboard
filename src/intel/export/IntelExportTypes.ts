// IntelExportTypes.ts
// Local types for adapter & serialization without pulling incomplete legacy structures.

export interface IntelExportRecord {
  id: string;
  title: string;
  created: string; // ISO
  updated?: string; // ISO
  classification: string; // e.g. UNCLASS (placeholder)
  priority: 'critical' | 'high' | 'medium' | 'low';
  sources: string[];
  tags?: string[] | undefined;
  location?: { lat: number; lon: number; name?: string } | undefined;
  summary?: string | undefined;
  body: string;
  confidence?: number | string | undefined;
}

export interface IntelValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface IntelValidationResult {
  valid: boolean;
  issues: IntelValidationIssue[];
}
