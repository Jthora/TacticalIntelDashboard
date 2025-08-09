/**
 * IntelRepository - Git Wrapper for Intel Operations
 * 
 * IntelRepository provides Git-based version control specifically designed for Intel workflows.
 * It wraps standard Git operations with Intel-specific functionality like file format conversion,
 * Intel serialization, and workspace management.
 * 
 * This is a Git WRAPPER, not a complex database-like repository.
 * It focuses on file-based operations with .intel and .intelReport files.
 * 
 * INTEGRATION_TAG: INTEL_FILE_FORMAT_REFERENCE 2025-08-09 (external compatibility marker)
 */

import { IntelWorkspace } from './IntelWorkspace';

// NOTE: Intel and IntelReport types available for future implementation
// import { Intel } from '../models/Intel/Intel';
// import { IntelReport } from '../models/Intel/IntelReport';

// =============================================================================
// CORE INTELREPOSITORY INTERFACES
// =============================================================================

/**
 * IntelRepository - Git wrapper for Intel file operations
 */
export interface IntelRepository {
  // Repository Configuration
  workspacePath: string;
  repositoryUrl?: string;
  branch: string;
  
  // =============================================================================
  // BASIC GIT OPERATIONS
  // =============================================================================
  
  /**
   * Initialize a new Git repository in the workspace
   */
  init(workspacePath: string): Promise<void>;
  
  /**
   * Clone a remote repository to create a local IntelWorkspace
   */
  clone(url: string, localPath: string): Promise<IntelWorkspace>;
  
  /**
   * Add files to Git staging area
   */
  add(files?: string[]): Promise<void>;
  
  /**
   * Commit staged changes with a message
   */
  commit(message: string, files?: string[]): Promise<string>;
  
  /**
   * Push commits to remote repository
   */
  push(remote?: string, branch?: string): Promise<void>;
  
  /**
   * Pull changes from remote repository
   */
  pull(remote?: string, branch?: string): Promise<void>;
  
  /**
   * Check repository status
   */
  status(): Promise<GitStatus>;
  
  /**
   * Create a new branch
   */
  createBranch(branchName: string, fromBranch?: string): Promise<void>;
  
  /**
   * Switch to a different branch
   */
  checkoutBranch(branchName: string): Promise<void>;
  
  /**
   * Merge branches
   */
  merge(sourceBranch: string, targetBranch?: string): Promise<MergeResult>;
  
  // =============================================================================
  // INTEL-SPECIFIC FILE OPERATIONS
  // =============================================================================
  
  /**
   * Save an Intel object as a .intel file and optionally commit
   */
  saveIntel(intel: IntelData, options?: SaveOptions): Promise<string>;
  
  /**
   * Save an IntelReport object as a .intelReport file and optionally commit
   */
  saveIntelReport(report: IntelReportData, options?: SaveOptions): Promise<string>;
  
  /**
   * Load an Intel object from a .intel file
   */
  loadIntel(filePath: string): Promise<IntelData>;
  
  /**
   * Load an IntelReport object from a .intelReport file
   */
  loadIntelReport(filePath: string): Promise<IntelReportData>;
  
  /**
   * List all Intel files in the repository
   */
  listIntelFiles(pattern?: string): Promise<IntelFileInfo[]>;
  
  /**
   * List all IntelReport files in the repository
   */
  listIntelReportFiles(pattern?: string): Promise<IntelReportFileInfo[]>;
  
  /**
   * Delete an Intel file (move to trash or permanent delete)
   */
  deleteIntelFile(filePath: string, permanent?: boolean): Promise<void>;
  
  /**
   * Delete an IntelReport file (move to trash or permanent delete)
   */
  deleteIntelReportFile(filePath: string, permanent?: boolean): Promise<void>;
  
  // =============================================================================
  // FORMAT CONVERSION HELPERS
  // =============================================================================
  
  /**
   * Convert .intel file to .md file (same content, different extension)
   */
  convertToMd(intelFile: string): Promise<string>;
  
  /**
   * Convert .md file to .intel file (same content, different extension)
   */
  convertToIntel(mdFile: string): Promise<string>;
  
  /**
   * Convert .intelReport file to .json file (same content, different extension)
   */
  convertToJson(reportFile: string): Promise<string>;
  
  /**
   * Convert .json file to .intelReport file (same content, different extension)
   */
  convertToIntelReport(jsonFile: string): Promise<string>;
  
  /**
   * Batch convert files between formats
   */
  batchConvert(files: string[], targetFormat: FileFormat): Promise<ConversionResult[]>;
  
  // =============================================================================
  // INTEL SERIALIZATION & DESERIALIZATION
  // =============================================================================
  
  /**
   * Serialize Intel object to .intel file format (markdown + frontmatter)
   */
  serializeIntel(intel: IntelData): Promise<IntelFileContent>;
  
  /**
   * Deserialize .intel file content to Intel object
   */
  deserializeIntel(fileContent: IntelFileContent): Promise<IntelData>;
  
  /**
   * Serialize IntelReport object to .intelReport file format (JSON)
   */
  serializeIntelReport(report: IntelReportData): Promise<IntelReportFileContent>;
  
  /**
   * Deserialize .intelReport file content to IntelReport object
   */
  deserializeIntelReport(fileContent: IntelReportFileContent): Promise<IntelReportData>;
  
  // =============================================================================
  // WORKSPACE INTEGRATION
  // =============================================================================
  
  /**
   * Get the IntelWorkspace associated with this repository
   */
  getWorkspace(): Promise<IntelWorkspace>;
  
  /**
   * Update workspace configuration
   */
  updateWorkspace(config: Partial<IntelWorkspace>): Promise<void>;
  
  /**
   * Sync workspace metadata with Git repository
   */
  syncWorkspaceMetadata(): Promise<void>;
  
  /**
   * Validate workspace structure and Git repository
   */
  validateWorkspace(): Promise<WorkspaceValidationResult>;
  
  // =============================================================================
  // COLLABORATION FEATURES
  // =============================================================================
  
  /**
   * Get file history for a specific Intel file
   */
  getFileHistory(filePath: string, maxEntries?: number): Promise<FileHistoryEntry[]>;
  
  /**
   * Get diff between two versions of a file
   */
  getFileDiff(filePath: string, version1: string, version2: string): Promise<FileDiff>;
  
  /**
   * Create a tag for the current state
   */
  createTag(tagName: string, message?: string): Promise<void>;
  
  /**
   * List all tags in the repository
   */
  listTags(): Promise<TagInfo[]>;
  
  /**
   * Get contributors to the repository
   */
  getContributors(): Promise<ContributorInfo[]>;
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

/**
 * Options for saving Intel/IntelReport files
 */
export interface SaveOptions {
  // File Format
  format?: FileFormat;
  preserveOriginalFormat?: boolean;
  
  // Content Options
  includeFrontmatter?: boolean;
  includeMetadata?: boolean;
  sanitizeContent?: boolean;
  
  // Git Options
  autoCommit?: boolean;
  commitMessage?: string;
  addToGit?: boolean;
  
  // Validation
  validateBeforeSave?: boolean;
  createBackup?: boolean;
  
  // Path Options
  customPath?: string;
  useSubdirectories?: boolean;
}

/**
 * File format types
 */
export type FileFormat = 'intel' | 'md' | 'intelReport' | 'json';

/**
 * Git repository status
 */
export interface GitStatus {
  // Branch Information
  currentBranch: string;
  remoteBranch?: string;
  
  // Change Status
  modified: string[];
  added: string[];
  deleted: string[];
  untracked: string[];
  conflicted: string[];
  
  // Sync Status
  ahead: number; // Commits ahead of remote
  behind: number; // Commits behind remote
  
  // Repository State
  isClean: boolean;
  hasConflicts: boolean;
  isDetached: boolean;
}

/**
 * Merge operation result
 */
export interface MergeResult {
  success: boolean;
  conflicts: string[];
  mergedFiles: string[];
  aborted: boolean;
  message: string;
}

/**
 * Intel file information
 */
export interface IntelFileInfo {
  path: string;
  filename: string;
  extension: '.intel' | '.md';
  size: number;
  
  // Git Information
  lastCommit: string;
  lastModified: string;
  author: string;
  
  // Intel Metadata
  intelId?: string;
  title?: string;
  type?: string;
  tags?: string[];
}

/**
 * IntelReport file information
 */
export interface IntelReportFileInfo {
  path: string;
  filename: string;
  extension: '.intelReport' | '.json';
  size: number;
  
  // Git Information
  lastCommit: string;
  lastModified: string;
  author: string;
  
  // Report Metadata
  reportId?: string;
  title?: string;
  type?: string;
  priority?: string;
}

/**
 * File content for .intel files
 */
export interface IntelFileContent {
  frontmatter: string; // YAML frontmatter
  content: string; // Markdown content
  raw: string; // Complete file content
}

/**
 * File content for .intelReport files
 */
export interface IntelReportFileContent {
  data: object; // JSON data
  raw: string; // Complete file content
}

/**
 * Format conversion result
 */
export interface ConversionResult {
  originalFile: string;
  convertedFile: string;
  success: boolean;
  error?: string;
  sizeChange: number; // Bytes difference
}

/**
 * File history entry
 */
export interface FileHistoryEntry {
  commit: string;
  author: string;
  date: string;
  message: string;
  changes: FileChange[];
}

/**
 * File change information
 */
export interface FileChange {
  type: 'ADD' | 'MODIFY' | 'DELETE' | 'RENAME';
  oldPath?: string;
  newPath?: string;
  linesAdded: number;
  linesRemoved: number;
}

/**
 * File diff information
 */
export interface FileDiff {
  oldVersion: string;
  newVersion: string;
  changes: DiffChunk[];
  summary: DiffSummary;
}

/**
 * Diff chunk (section of changes)
 */
export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

/**
 * Individual diff line
 */
export interface DiffLine {
  type: 'ADD' | 'REMOVE' | 'CONTEXT';
  content: string;
  lineNumber: number;
}

/**
 * Diff summary
 */
export interface DiffSummary {
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
  totalChanges: number;
}

/**
 * Git tag information
 */
export interface TagInfo {
  name: string;
  commit: string;
  author: string;
  date: string;
  message?: string;
  isAnnotated: boolean;
}

/**
 * Repository contributor information
 */
export interface ContributorInfo {
  name: string;
  email: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
  firstCommit: string;
  lastCommit: string;
}

/**
 * Workspace validation result (re-exported for convenience)
 */
export interface WorkspaceValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  
  // Validation Details
  structureValid: boolean;
  filesValid: boolean;
  metadataValid: boolean;
  gitValid: boolean;
  
  // Statistics
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  
  // Recommendations
  recommendations: string[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  file?: string;
  line?: number;
  field?: string;
  severity: 'ERROR' | 'CRITICAL';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  file?: string;
  line?: number;
  field?: string;
  recommendation?: string;
}

// =============================================================================
// PLACEHOLDER INTERFACES FOR INTEL DATA
// =============================================================================
// These will be replaced with actual Intel/IntelReport imports once available

/**
 * Placeholder for Intel data structure
 */
export interface IntelData {
  id: string;
  title: string;
  content: string;
  type: string;
  source: string;
  timestamp: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

/**
 * Placeholder for IntelReport data structure
 */
export interface IntelReportData {
  id: string;
  title: string;
  content: string;
  summary: string;
  type: string;
  priority: string;
  author: string;
  createdAt: string;
  sourceIntel: string[];
  metadata: Record<string, unknown>;
}

// =============================================================================
// INTEL COLLABORATION REPOSITORY EXTENSION
// =============================================================================

/**
 * Enhanced IntelRepository with team collaboration features
 */
export interface IntelCollaborationRepository extends IntelRepository {
  // =============================================================================
  // TEAM OPERATIONS
  // =============================================================================
  
  /**
   * Create a branch for Intel work
   */
  createIntelBranch(branchName: string, fromIntel?: string): Promise<void>;
  
  /**
   * Merge Intel changes between branches
   */
  mergeIntelChanges(sourceBranch: string, targetBranch: string): Promise<MergeResult>;
  
  /**
   * Resolve conflicts in Intel files
   */
  resolveIntelConflicts(conflictedFiles: string[]): Promise<void>;
  
  // =============================================================================
  // COLLABORATION FEATURES
  // =============================================================================
  
  /**
   * Request review for Intel files
   */
  requestReview(intelId: string, reviewers: string[]): Promise<ReviewRequest>;
  
  /**
   * Approve Intel files after review
   */
  approveIntel(intelId: string, reviewComment?: string): Promise<void>;
  
  /**
   * Publish Intel to main branch
   */
  publishIntel(intelId: string, targetBranch?: string): Promise<void>;
  
  // =============================================================================
  // ADVANCED GIT FEATURES
  // =============================================================================
  
  /**
   * Cherry-pick specific Intel changes to another branch
   */
  cherryPickIntel(intelId: string, targetBranch: string): Promise<void>;
  
  /**
   * Compare Intel versions across branches
   */
  compareIntelVersions(intelId: string, version1: string, version2: string): Promise<IntelComparison>;
  
  /**
   * Create pull request for Intel changes
   */
  createPullRequest(sourceBranch: string, targetBranch: string, title: string, description: string): Promise<PullRequest>;
  
  /**
   * Get Intel modification statistics
   */
  getIntelStats(timeRange?: string): Promise<IntelStats>;
}

/**
 * Review request for Intel files
 */
export interface ReviewRequest {
  id: string;
  intelId: string;
  requestedBy: string;
  reviewers: string[];
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  comments: ReviewComment[];
}

/**
 * Review comment
 */
export interface ReviewComment {
  id: string;
  author: string;
  content: string;
  line?: number;
  file?: string;
  createdAt: string;
  resolved: boolean;
}

/**
 * Intel version comparison
 */
export interface IntelComparison {
  intelId: string;
  version1: IntelVersionInfo;
  version2: IntelVersionInfo;
  differences: IntelDifference[];
  summary: ComparisonSummary;
}

/**
 * Intel version information
 */
export interface IntelVersionInfo {
  version: string;
  commit: string;
  author: string;
  date: string;
  message: string;
}

/**
 * Intel difference
 */
export interface IntelDifference {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'ADDED' | 'MODIFIED' | 'REMOVED';
}

/**
 * Comparison summary
 */
export interface ComparisonSummary {
  totalChanges: number;
  fieldsChanged: number;
  contentChanged: boolean;
  metadataChanged: boolean;
  significance: 'MINOR' | 'MODERATE' | 'MAJOR';
}

/**
 * Pull request information
 */
export interface PullRequest {
  id: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  createdAt: string;
  modifiedFiles: string[];
}

/**
 * Intel repository statistics
 */
export interface IntelStats {
  totalIntelFiles: number;
  totalReportFiles: number;
  totalCommits: number;
  activeContributors: number;
  changesLastWeek: number;
  changesLastMonth: number;
  mostActiveFiles: FileActivityInfo[];
  contributorActivity: ContributorActivity[];
}

/**
 * File activity information
 */
export interface FileActivityInfo {
  path: string;
  filename: string;
  commits: number;
  lastModified: string;
  contributors: string[];
}

/**
 * Contributor activity
 */
export interface ContributorActivity {
  contributor: string;
  commits: number;
  filesModified: number;
  linesAdded: number;
  linesRemoved: number;
  lastActivity: string;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

/**
 * Default save options
 */
export const DEFAULT_SAVE_OPTIONS: SaveOptions = {
  format: 'intel',
  preserveOriginalFormat: true,
  includeFrontmatter: true,
  includeMetadata: true,
  sanitizeContent: false,
  autoCommit: false,
  addToGit: true,
  validateBeforeSave: true,
  createBackup: true,
  useSubdirectories: false
};
