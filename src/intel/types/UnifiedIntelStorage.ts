/**
 * Unified Storage Interface for Intel System
 * 
 * This provides a single, unified interface across all storage systems
 * in the Intel ecosystem, resolving the fragmentation identified in the audit.
 * 
 * Supports: IntelDataStore, DataVault, IntelWorkspace, IntelRepository, 
 * StorageOrchestrator, and other storage systems.
 */

import { DataVault, ExportOptions, ImportResult } from './DataVault';
import { IntelWorkspace, SearchOptions, SearchResult } from './IntelWorkspace';
import { IntelRepository, SaveOptions } from './IntelRepository';

// =============================================================================
// UNIFIED STORAGE INTERFACE
// =============================================================================

/**
 * Unified Storage Interface - Single source of truth for all Intel storage operations
 */
export interface UnifiedIntelStorage {
  // =============================================================================
  // STORAGE SYSTEM MANAGEMENT
  // =============================================================================
  
  /**
   * Initialize the unified storage system
   */
  initialize(config: StorageConfig): Promise<void>;
  
  /**
   * Get current storage configuration
   */
  getConfig(): StorageConfig;
  
  /**
   * Update storage configuration
   */
  updateConfig(config: Partial<StorageConfig>): Promise<void>;
  
  /**
   * Get storage system health status
   */
  getHealthStatus(): Promise<StorageHealthStatus>;
  
  // =============================================================================
  // WORKSPACE OPERATIONS
  // =============================================================================
  
  /**
   * Create a new IntelWorkspace
   */
  createWorkspace(name: string, options?: WorkspaceCreationOptions): Promise<IntelWorkspace>;
  
  /**
   * Open an existing IntelWorkspace
   */
  openWorkspace(path: string): Promise<IntelWorkspace>;
  
  /**
   * Close a workspace
   */
  closeWorkspace(workspaceId: string): Promise<void>;
  
  /**
   * List all available workspaces
   */
  listWorkspaces(): Promise<WorkspaceInfo[]>;
  
  /**
   * Get active workspace
   */
  getActiveWorkspace(): IntelWorkspace | null;
  
  /**
   * Switch to a different workspace
   */
  switchWorkspace(workspaceId: string): Promise<void>;
  
  // =============================================================================
  // INTEL DATA OPERATIONS
  // =============================================================================
  
  /**
   * Save Intel data to current workspace
   */
  saveIntel(intel: IntelData, options?: SaveOptions): Promise<string>;
  
  /**
   * Load Intel data by ID or path
   */
  loadIntel(identifier: string): Promise<IntelData>;
  
  /**
   * Update existing Intel data
   */
  updateIntel(id: string, intel: Partial<IntelData>, options?: SaveOptions): Promise<void>;
  
  /**
   * Delete Intel data
   */
  deleteIntel(id: string, permanent?: boolean): Promise<void>;
  
  /**
   * List all Intel in current workspace
   */
  listIntel(filter?: IntelFilter): Promise<IntelSummary[]>;
  
  /**
   * Search Intel across workspaces
   */
  searchIntel(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  
  // =============================================================================
  // INTEL REPORT OPERATIONS
  // =============================================================================
  
  /**
   * Save IntelReport data to current workspace
   */
  saveIntelReport(report: IntelReportData, options?: SaveOptions): Promise<string>;
  
  /**
   * Load IntelReport data by ID or path
   */
  loadIntelReport(identifier: string): Promise<IntelReportData>;
  
  /**
   * Update existing IntelReport data
   */
  updateIntelReport(id: string, report: Partial<IntelReportData>, options?: SaveOptions): Promise<void>;
  
  /**
   * Delete IntelReport data
   */
  deleteIntelReport(id: string, permanent?: boolean): Promise<void>;
  
  /**
   * List all IntelReports in current workspace
   */
  listIntelReports(filter?: ReportFilter): Promise<IntelReportSummary[]>;
  
  /**
   * Search IntelReports across workspaces
   */
  searchIntelReports(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  
  // =============================================================================
  // PACKAGE OPERATIONS
  // =============================================================================
  
  /**
   * Create an IntelReportPackage
   */
  createPackage(name: string, contents: PackageContents): Promise<string>;
  
  /**
   * Load an IntelReportPackage
   */
  loadPackage(identifier: string): Promise<IntelReportPackage>;
  
  /**
   * Update an IntelReportPackage
   */
  updatePackage(id: string, contents: Partial<PackageContents>): Promise<void>;
  
  /**
   * Delete an IntelReportPackage
   */
  deletePackage(id: string, permanent?: boolean): Promise<void>;
  
  /**
   * List all packages in current workspace
   */
  listPackages(filter?: PackageFilter): Promise<PackageSummary[]>;
  
  // =============================================================================
  // EXPORT/IMPORT OPERATIONS (DATAVAULT)
  // =============================================================================
  
  /**
   * Export Intel/Reports as DataVault
   */
  exportAsDataVault(items: ExportItem[], options?: ExportOptions): Promise<DataVault>;
  
  /**
   * Import from DataVault
   */
  importFromDataVault(vault: DataVault, targetWorkspace?: string): Promise<ImportResult>;
  
  /**
   * Create shareable export link
   */
  createShareableExport(items: ExportItem[], options?: ShareOptions): Promise<string>;
  
  /**
   * Import from shareable link
   */
  importFromShareableLink(link: string, targetWorkspace?: string): Promise<ImportResult>;
  
  // =============================================================================
  // VERSION CONTROL OPERATIONS (GIT)
  // =============================================================================
  
  /**
   * Initialize Git repository for workspace
   */
  initializeVersionControl(workspaceId: string, remoteUrl?: string): Promise<IntelRepository>;
  
  /**
   * Get Git repository for workspace
   */
  getRepository(workspaceId: string): IntelRepository | null;
  
  /**
   * Commit changes to version control
   */
  commitChanges(workspaceId: string, message: string, files?: string[]): Promise<string>;
  
  /**
   * Sync with remote repository
   */
  syncWithRemote(workspaceId: string, operation: 'push' | 'pull' | 'both'): Promise<void>;
  
  /**
   * Get version history for item
   */
  getVersionHistory(itemId: string, itemType: 'intel' | 'report' | 'package'): Promise<VersionHistoryEntry[]>;
  
  // =============================================================================
  // TRANSACTION OPERATIONS
  // =============================================================================
  
  /**
   * Begin a transaction across multiple storage systems
   */
  beginTransaction(): Promise<Transaction>;
  
  /**
   * Commit a transaction
   */
  commitTransaction(transaction: Transaction): Promise<void>;
  
  /**
   * Rollback a transaction
   */
  rollbackTransaction(transaction: Transaction): Promise<void>;
  
  /**
   * Execute operations within a transaction
   */
  executeInTransaction<T>(operations: () => Promise<T>): Promise<T>;
  
  // =============================================================================
  // CACHE AND PERFORMANCE
  // =============================================================================
  
  /**
   * Clear all caches
   */
  clearCache(): Promise<void>;
  
  /**
   * Preload frequently accessed data
   */
  preloadData(items: string[]): Promise<void>;
  
  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStatistics;
  
  /**
   * Optimize storage performance
   */
  optimizeStorage(): Promise<OptimizationResult>;
  
  // =============================================================================
  // BACKUP AND RECOVERY
  // =============================================================================
  
  /**
   * Create backup of workspace
   */
  createBackup(workspaceId: string, options?: BackupOptions): Promise<string>;
  
  /**
   * Restore workspace from backup
   */
  restoreFromBackup(backupPath: string, targetWorkspace?: string): Promise<void>;
  
  /**
   * List available backups
   */
  listBackups(workspaceId?: string): Promise<BackupInfo[]>;
  
  /**
   * Delete old backups
   */
  cleanupBackups(workspaceId: string, keepCount?: number): Promise<void>;
}

// =============================================================================
// SUPPORTING INTERFACES
// =============================================================================

/**
 * Storage system configuration
 */
export interface StorageConfig {
  // Workspace Settings
  defaultWorkspacePath: string;
  autoCreateWorkspaces: boolean;
  maxActiveWorkspaces: number;
  
  // Storage Backends
  enableInMemoryStorage: boolean;
  enableFileSystemStorage: boolean;
  enableIndexedDBStorage: boolean;
  enableIPFSStorage: boolean;
  enableBlockchainStorage: boolean;
  
  // Performance Settings
  cacheSize: number; // MB
  enableCompression: boolean;
  enableEncryption: boolean;
  
  // Git Settings
  defaultGitProvider: 'github' | 'gitlab' | 'local';
  autoCommit: boolean;
  autoSync: boolean;
  
  // Backup Settings
  enableAutoBackup: boolean;
  backupInterval: number; // Minutes
  maxBackups: number;
  
  // Security Settings
  encryptSensitiveData: boolean;
  requireAuthentication: boolean;
  sessionTimeout: number; // Minutes
}

/**
 * Storage system health status
 */
export interface StorageHealthStatus {
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  
  // Individual Systems
  inMemoryStorage: SystemStatus;
  fileSystemStorage: SystemStatus;
  indexedDBStorage: SystemStatus;
  gitRepository: SystemStatus;
  cache: SystemStatus;
  
  // Performance Metrics
  responseTime: number; // ms
  throughput: number; // operations/second
  errorRate: number; // percentage
  
  // Resource Usage
  memoryUsage: number; // MB
  diskUsage: number; // MB
  networkUsage: number; // KB/s
  
  // Issues
  issues: HealthIssue[];
  recommendations: string[];
}

/**
 * Individual system status
 */
export interface SystemStatus {
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'DEGRADED';
  lastCheck: string;
  responseTime?: number;
  errorMessage?: string;
}

/**
 * Health issue
 */
export interface HealthIssue {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component: string;
  message: string;
  details?: string;
  resolution?: string;
}

/**
 * Workspace creation options
 */
export interface WorkspaceCreationOptions {
  type?: 'local' | 'git' | 'shared';
  template?: string;
  gitUrl?: string;
  structure?: Partial<WorkspaceStructure>;
  settings?: Partial<WorkspaceSettings>;
}

/**
 * Workspace information
 */
export interface WorkspaceInfo {
  id: string;
  name: string;
  path: string;
  type: string;
  createdAt: string;
  lastAccessed: string;
  size: number; // bytes
  fileCount: number;
  isActive: boolean;
  hasGit: boolean;
  hasChanges: boolean;
}

/**
 * Intel filter options
 */
export interface IntelFilter {
  tags?: string[];
  categories?: string[];
  types?: string[];
  sources?: string[];
  dateRange?: DateRange;
  classification?: string[];
  reliability?: string[];
  verified?: boolean;
}

/**
 * Intel summary
 */
export interface IntelSummary {
  id: string;
  title: string;
  type: string;
  source: string;
  timestamp: number;
  tags: string[];
  classification: string;
  reliability: string;
  size: number;
  path: string;
}

/**
 * Report filter options
 */
export interface ReportFilter {
  types?: string[];
  priorities?: string[];
  authors?: string[];
  dateRange?: DateRange;
  status?: string[];
  classification?: string[];
}

/**
 * IntelReport summary
 */
export interface IntelReportSummary {
  id: string;
  title: string;
  type: string;
  priority: string;
  author: string;
  createdAt: string;
  status: string;
  sourceIntelCount: number;
  size: number;
  path: string;
}

/**
 * Package contents
 */
export interface PackageContents {
  reports: string[]; // Report IDs
  intel: string[]; // Intel IDs
  assets: string[]; // Asset paths
  metadata?: Record<string, unknown>;
}

/**
 * Package filter options
 */
export interface PackageFilter {
  types?: string[];
  authors?: string[];
  dateRange?: DateRange;
  tags?: string[];
  hasReports?: boolean;
  hasIntel?: boolean;
}

/**
 * Package summary
 */
export interface PackageSummary {
  id: string;
  name: string;
  type: string;
  version: string;
  author: string;
  createdAt: string;
  reportCount: number;
  intelCount: number;
  assetCount: number;
  size: number;
  path: string;
}

/**
 * Export item specification
 */
export interface ExportItem {
  id: string;
  type: 'intel' | 'report' | 'package';
  includeRelated?: boolean;
  includeAssets?: boolean;
}

/**
 * Share options for exports
 */
export interface ShareOptions extends ExportOptions {
  expiresAt?: string; // ISO date string
  password?: string;
  allowDownload?: boolean;
  trackAccess?: boolean;
  maxDownloads?: number;
}

/**
 * Version history entry
 */
export interface VersionHistoryEntry {
  version: string;
  commit: string;
  author: string;
  timestamp: string;
  message: string;
  changes: ChangeInfo[];
}

/**
 * Change information
 */
export interface ChangeInfo {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'ADD' | 'MODIFY' | 'DELETE';
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  startedAt: string;
  operations: TransactionOperation[];
  status: 'ACTIVE' | 'COMMITTED' | 'ROLLED_BACK';
}

/**
 * Transaction operation
 */
export interface TransactionOperation {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  target: string;
  data?: unknown;
  undoData?: unknown;
}

/**
 * Cache statistics
 */
export interface CacheStatistics {
  totalSize: number; // bytes
  hitRate: number; // percentage
  missRate: number; // percentage
  evictions: number;
  entries: number;
  oldestEntry: string;
  newestEntry: string;
}

/**
 * Storage optimization result
 */
export interface OptimizationResult {
  performed: string[];
  spaceFreed: number; // bytes
  performanceImprovement: number; // percentage
  recommendations: string[];
  duration: number; // milliseconds
}

/**
 * Backup options
 */
export interface BackupOptions {
  includeAssets: boolean;
  includeHistory: boolean;
  compress: boolean;
  encrypt: boolean;
  password?: string;
  excludePatterns?: string[];
}

/**
 * Backup information
 */
export interface BackupInfo {
  id: string;
  workspaceId: string;
  path: string;
  createdAt: string;
  size: number; // bytes
  compressed: boolean;
  encrypted: boolean;
  description?: string;
}

/**
 * Date range
 */
export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

// =============================================================================
// PLACEHOLDER INTERFACES
// =============================================================================
// These will be replaced with actual imports once available

/**
 * Placeholder for Intel data
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
 * Placeholder for IntelReport data
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

/**
 * Placeholder for IntelReportPackage data
 */
export interface IntelReportPackage {
  id: string;
  name: string;
  type: string;
  version: string;
  path: string;
  contents: PackageContents;
  metadata: Record<string, unknown>;
}

/**
 * Workspace structure (re-export for convenience)
 */
export interface WorkspaceStructure {
  intelDir: string;
  reportsDir: string;
  packagesDir: string;
  assetsDir: string;
  templatesDir: string;
  archiveDir?: string;
  trashDir?: string;
  metadataDir?: string;
  useSubdirectories: boolean;
  subdirectoryPattern: 'date' | 'category' | 'type' | 'custom';
  maxFilesPerDirectory: number;
}

/**
 * Workspace settings (re-export for convenience)
 */
export interface WorkspaceSettings {
  defaultIntelFormat: 'intel' | 'md';
  defaultReportFormat: 'intelReport' | 'json';
  preserveOriginalFormat: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  createBackups: boolean;
  maxBackups: number;
  autoCommit: boolean;
  commitMessage: string;
  autoPush: boolean;
  pullOnOpen: boolean;
  enableFullTextSearch: boolean;
  indexAssets: boolean;
  rebuildIndexOnStart: boolean;
  encryptSensitiveFiles: boolean;
  requirePassword: boolean;
  sessionTimeout: number;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

/**
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  defaultWorkspacePath: './intel-workspaces',
  autoCreateWorkspaces: true,
  maxActiveWorkspaces: 5,
  enableInMemoryStorage: true,
  enableFileSystemStorage: true,
  enableIndexedDBStorage: true,
  enableIPFSStorage: false,
  enableBlockchainStorage: false,
  cacheSize: 100, // 100 MB
  enableCompression: true,
  enableEncryption: false,
  defaultGitProvider: 'local',
  autoCommit: false,
  autoSync: false,
  enableAutoBackup: true,
  backupInterval: 60, // 1 hour
  maxBackups: 10,
  encryptSensitiveData: true,
  requireAuthentication: false,
  sessionTimeout: 480 // 8 hours
};
