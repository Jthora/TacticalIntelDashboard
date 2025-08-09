/**
 * IntelWorkspace - File-Based Intel Management
 * 
 * IntelWorkspace provides a file-based architecture for managing Intel and IntelReports
 * similar to Obsidian vaults. It supports .intel files (markdown with frontmatter),
 * .intelReport files (JSON), and .intelReportPackage folders.
 * 
 * File Format Interchangeability:
 * - .intel files ↔ .md files (same content, different extensions)
 * - .intelReport files ↔ .json files (same content, different extensions)
 * 
 * INTEGRATION_TAG: INTEL_FILE_FORMAT_REFERENCE 2025-08-09 (external compatibility marker)
 */

// NOTE: Intel and IntelReport types are available for future use
// import { Intel } from '../models/Intel/Intel';
// import { IntelReport } from '../models/Intel/IntelReport';

// =============================================================================
// CORE INTELWORKSPACE INTERFACES
// =============================================================================

/**
 * IntelWorkspace represents a file-based workspace for Intel management
 */
export interface IntelWorkspace {
  // Workspace Configuration
  path: string; // Absolute path to workspace root
  name: string; // Workspace name
  type: 'obsidian-style' | 'custom' | 'git-repo';
  
  // Workspace Structure
  structure: WorkspaceStructure;
  
  // Git Integration (optional)
  gitRepository?: GitRepositoryInfo;
  
  // Workspace Metadata
  createdAt: string;
  modifiedAt: string;
  createdBy: string;
  version: string;
  
  // Configuration Settings
  settings: WorkspaceSettings;
}

/**
 * Workspace directory structure configuration
 */
export interface WorkspaceStructure {
  // Core Directories
  intelDir: string; // Directory for .intel files (default: 'intel/')
  reportsDir: string; // Directory for .intelReport files (default: 'reports/')
  packagesDir: string; // Directory for .intelReportPackage folders (default: 'packages/')
  assetsDir: string; // Directory for assets (images, docs, etc.) (default: 'assets/')
  templatesDir: string; // Directory for templates (default: 'templates/')
  
  // Special Directories
  archiveDir?: string; // Directory for archived content (default: 'archive/')
  trashDir?: string; // Directory for deleted content (default: '.trash/')
  metadataDir?: string; // Directory for workspace metadata (default: '.metadata/')
  
  // File Organization
  useSubdirectories: boolean; // Organize files in subdirectories by date/category
  subdirectoryPattern: 'date' | 'category' | 'type' | 'custom';
  maxFilesPerDirectory: number; // Maximum files before creating subdirectories
}

/**
 * Workspace configuration settings
 */
export interface WorkspaceSettings {
  // File Format Settings
  defaultIntelFormat: 'intel' | 'md'; // Default format for Intel files
  defaultReportFormat: 'intelReport' | 'json'; // Default format for Report files
  preserveOriginalFormat: boolean; // Keep original file extensions when importing
  
  // Auto-save Settings
  autoSave: boolean;
  autoSaveInterval: number; // Milliseconds
  createBackups: boolean;
  maxBackups: number;
  
  // Git Integration Settings
  autoCommit: boolean;
  commitMessage: string; // Template for commit messages
  autoPush: boolean;
  pullOnOpen: boolean;
  
  // Search and Indexing
  enableFullTextSearch: boolean;
  indexAssets: boolean;
  rebuildIndexOnStart: boolean;
  
  // Security Settings
  encryptSensitiveFiles: boolean;
  requirePassword: boolean;
  sessionTimeout: number; // Minutes
}

/**
 * Git repository information for workspace
 */
export interface GitRepositoryInfo {
  url: string;
  branch: string;
  remotes: GitRemote[];
  lastSync: string;
  syncStatus: 'SYNCED' | 'AHEAD' | 'BEHIND' | 'DIVERGED' | 'CONFLICT';
}

/**
 * Git remote configuration
 */
export interface GitRemote {
  name: string;
  url: string;
  type: 'origin' | 'upstream' | 'backup';
}

// =============================================================================
// FILE FORMAT INTERFACES
// =============================================================================

/**
 * .intel file format (markdown with frontmatter)
 */
export interface IntelFile {
  // File Metadata
  path: string;
  filename: string;
  extension: '.intel' | '.md';
  
  // Frontmatter (YAML)
  frontmatter: IntelFrontmatter;
  
  // Content (Markdown)
  content: string;
  
  // File System Info
  size: number;
  createdAt: string;
  modifiedAt: string;
  checksum: string;
}

/**
 * Frontmatter for .intel files (YAML format)
 */
export interface IntelFrontmatter {
  // Core Intel Properties
  id: string;
  title: string;
  type: string;
  classification: string;
  
  // Source Information
  source: string;
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  confidence: number;
  
  // Temporal Information
  timestamp: number;
  collectedAt: string;
  
  // Geographic Information
  latitude?: number;
  longitude?: number;
  location?: string;
  
  // Metadata
  tags: string[];
  categories: string[];
  
  // Relationships
  relatedIntel?: string[];
  parentIntel?: string;
  childIntel?: string[];
  
  // Quality Assessment
  quality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    relevance: number;
  };
  
  // Processing Information
  verified: boolean;
  processedBy?: string;
  processedAt?: string;
  
  // Custom Fields
  [key: string]: unknown;
}

/**
 * .intelReport file format (JSON)
 */
export interface IntelReportFile {
  // File Metadata
  path: string;
  filename: string;
  extension: '.intelReport' | '.json';
  
  // Report Data (JSON)
  reportData: IntelReportData;
  
  // File System Info
  size: number;
  createdAt: string;
  modifiedAt: string;
  checksum: string;
}

/**
 * JSON structure for .intelReport files
 */
export interface IntelReportData {
  // Report Metadata
  id: string;
  title: string;
  type: string;
  classification: string;
  
  // Report Content
  summary: string;
  content: string;
  conclusions: string[];
  recommendations: string[];
  
  // Analysis Information
  analysisType: string;
  methodology: string[];
  confidence: number;
  priority: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE';
  
  // Source Intel References
  sourceIntel: string[]; // IDs of Intel that contributed to this report
  intelContent?: IntelFile[]; // Embedded Intel content (optional)
  
  // Authorship and Review
  author: string;
  contributors: string[];
  reviewedBy?: string[];
  approvedBy?: string;
  
  // Temporal Information
  createdAt: string;
  modifiedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  
  // Distribution
  targetAudience: string[];
  distributionRestrictions?: string[];
  
  // Relationships
  relatedReports?: string[];
  supersedes?: string;
  supersededBy?: string;
  
  // Custom Fields
  metadata: Record<string, unknown>;
}

/**
 * .intelReportPackage folder structure
 */
export interface IntelReportPackage {
  // Package Metadata
  path: string; // Path to package folder
  name: string;
  type: string;
  
  // Package Structure
  structure: PackageStructure;
  
  // Package Contents
  reports: IntelReportFile[];
  supportingIntel: IntelFile[];
  assets: AssetFile[];
  
  // Package Metadata File
  metadata: PackageMetadata;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
}

/**
 * Package folder structure
 */
export interface PackageStructure {
  reportsDir: string; // Subfolder for reports
  intelDir: string; // Subfolder for supporting Intel
  assetsDir: string; // Subfolder for assets
  metadataFile: string; // Metadata file path
  readmeFile?: string; // Optional README file
}

/**
 * Asset file information
 */
export interface AssetFile {
  path: string;
  filename: string;
  type: string;
  mimeType: string;
  size: number;
  checksum: string;
  description?: string;
  tags: string[];
}

/**
 * Package metadata file content
 */
export interface PackageMetadata {
  // Package Information
  id: string;
  name: string;
  version: string;
  description: string;
  
  // Package Contents
  reports: string[]; // List of report files
  intel: string[]; // List of Intel files
  assets: string[]; // List of asset files
  
  // Authorship
  author: string;
  contributors: string[];
  maintainer: string;
  
  // Dependencies
  dependencies: PackageDependency[];
  
  // Temporal Information
  createdAt: string;
  modifiedAt: string;
  
  // Validation
  checksum: string;
  
  // Custom Fields
  [key: string]: unknown;
}

/**
 * Package dependency information
 */
export interface PackageDependency {
  name: string;
  version: string;
  type: 'required' | 'optional' | 'development';
  source?: string; // Where to find the dependency
}

// =============================================================================
// WORKSPACE OPERATION INTERFACES
// =============================================================================

/**
 * Options for creating a new workspace
 */
export interface CreateWorkspaceOptions {
  // Basic Configuration
  name: string;
  type: 'obsidian-style' | 'custom' | 'git-repo';
  
  // Git Configuration (optional)
  gitUrl?: string;
  cloneFromRemote?: boolean;
  
  // Directory Structure
  customStructure?: Partial<WorkspaceStructure>;
  
  // Initial Settings
  settings?: Partial<WorkspaceSettings>;
  
  // Initial Content
  createSampleFiles?: boolean;
  importFromPath?: string;
}

/**
 * Options for file operations
 */
export interface FileOperationOptions {
  // Format Options
  format?: 'intel' | 'md' | 'intelReport' | 'json';
  preserveFormat?: boolean;
  convertFormat?: boolean;
  
  // Content Options
  includeFrontmatter?: boolean;
  includeMetadata?: boolean;
  sanitizeContent?: boolean;
  
  // Validation Options
  validateBeforeSave?: boolean;
  createBackup?: boolean;
  
  // Git Options
  autoCommit?: boolean;
  commitMessage?: string;
}

/**
 * Search options for workspace content
 */
export interface SearchOptions {
  // Search Scope
  searchIntel: boolean;
  searchReports: boolean;
  searchAssets: boolean;
  
  // Search Criteria
  query: string;
  tags?: string[];
  categories?: string[];
  dateRange?: DateRange;
  
  // Search Type
  fullText: boolean;
  exactMatch: boolean;
  regex: boolean;
  
  // Result Options
  maxResults?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'type';
  includeContent?: boolean;
}

/**
 * Date range for searches and filters
 */
export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

/**
 * Search result information
 */
export interface SearchResult {
  // File Information
  path: string;
  filename: string;
  type: 'intel' | 'intelReport' | 'asset';
  
  // Match Information
  matches: SearchMatch[];
  relevance: number;
  
  // Content Preview
  preview: string;
  
  // Metadata
  title: string;
  tags: string[];
  modifiedAt: string;
}

/**
 * Individual search match
 */
export interface SearchMatch {
  field: string; // Field where match was found
  text: string; // Matched text
  context: string; // Surrounding context
  position: number; // Position in content
}

// =============================================================================
// WORKSPACE VALIDATION INTERFACES
// =============================================================================

/**
 * Workspace validation result
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
 * File validation result
 */
export interface FileValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  
  // Validation Details
  formatValid: boolean;
  contentValid: boolean;
  metadataValid: boolean;
  checksumValid: boolean;
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
// DEFAULT CONFIGURATIONS
// =============================================================================

/**
 * Default workspace structure
 */
export const DEFAULT_WORKSPACE_STRUCTURE: WorkspaceStructure = {
  intelDir: 'intel',
  reportsDir: 'reports',
  packagesDir: 'packages',
  assetsDir: 'assets',
  templatesDir: 'templates',
  archiveDir: 'archive',
  trashDir: '.trash',
  metadataDir: '.metadata',
  useSubdirectories: false,
  subdirectoryPattern: 'date',
  maxFilesPerDirectory: 100
};

/**
 * Default workspace settings
 */
export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  defaultIntelFormat: 'intel',
  defaultReportFormat: 'intelReport',
  preserveOriginalFormat: true,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  createBackups: true,
  maxBackups: 10,
  autoCommit: false,
  commitMessage: 'Auto-save: {filename}',
  autoPush: false,
  pullOnOpen: false,
  enableFullTextSearch: true,
  indexAssets: true,
  rebuildIndexOnStart: false,
  encryptSensitiveFiles: false,
  requirePassword: false,
  sessionTimeout: 480 // 8 hours
};

/**
 * Default package structure
 */
export const DEFAULT_PACKAGE_STRUCTURE: PackageStructure = {
  reportsDir: 'reports',
  intelDir: 'intel',
  assetsDir: 'assets',
  metadataFile: 'package.json',
  readmeFile: 'README.md'
};
