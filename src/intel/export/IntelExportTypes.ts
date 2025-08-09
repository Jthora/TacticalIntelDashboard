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
  tags?: string[];
  location?: { lat: number; lon: number; name?: string };
  summary?: string;
  body: string;
  confidence?: number | string;
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
