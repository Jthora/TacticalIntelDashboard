# Security & Access Control Implementation Guide

## Overview
This guide details the security architecture and access control implementation for the Tactical Intelligence Dashboard, ensuring secure handling of classified information while maintaining operational efficiency.

### Dependency Security Posture (2026-01-12)
- jsPDF upgraded to 4.x to resolve CVE (LFI/path traversal in <=3.0.4)
- react-router / react-router-dom upgraded to 6.30.3 to address redirect/XSS advisories
- qs forced to >=6.14.1 via overrides to mitigate DoS advisory
- Remaining: 21 low-severity findings in hardhat/ethers/toolbox chain; remediation requires Node >=20 and toolbox major bump (pending); engine warnings for @nomicfoundation/edr on Node 18 noted

## Security Architecture Overview

### 1. Multi-layered Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              UI Security Controls                       │ │
│  │  • Classification Indicators                           │ │
│  │  • Role-based UI Elements                             │ │
│  │  │  • Data Masking & Redaction                        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Context Layer                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Access Control                            │ │
│  │  • Role-based Permissions                             │ │
│  │  • Resource Authorization                             │ │
│  │  • Session Management                                 │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Service Layer                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Data Security                             │ │
│  │  • Encryption at Rest                                 │ │
│  │  • Encryption in Transit                              │ │
│  │  • Audit Logging                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Network Layer                            │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Transport Security                        │ │
│  │  • TLS/SSL Encryption                                 │ │
│  │  • Certificate Validation                             │ │
│  │  • Network Isolation                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2. Classification System

```typescript
// Security classification definitions
export type ClassificationLevel = 'UNCLASSIFIED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

export interface ClassificationMetadata {
  level: ClassificationLevel;
  caveats?: string[]; // e.g., ['NOFORN', 'EYES ONLY']
  declassifyOn?: Date;
  originator: string;
  derivedFrom?: string[];
  releasableTo?: string[]; // Countries or organizations
}

export interface SecureIntelligenceItem extends IntelligenceItem {
  classification: ClassificationMetadata;
  accessLog: AccessLogEntry[];
  sanitizedVersion?: Partial<IntelligenceItem>; // For lower clearance display
}

// Classification hierarchy and access rules
export const CLASSIFICATION_HIERARCHY: Record<ClassificationLevel, number> = {
  'UNCLASSIFIED': 0,
  'CONFIDENTIAL': 1,
  'SECRET': 2,
  'TOP_SECRET': 3
};

export const getClassificationColor = (level: ClassificationLevel): string => {
  const colors = {
    'UNCLASSIFIED': '#28a745',
    'CONFIDENTIAL': '#ffc107',
    'SECRET': '#fd7e14',
    'TOP_SECRET': '#dc3545'
  };
  return colors[level];
};
```

### 3. Role-Based Access Control (RBAC)

```typescript
// User roles and permissions
export interface UserRole {
  id: string;
  name: string;
  clearanceLevel: ClassificationLevel;
  permissions: Permission[];
  restrictions: Restriction[];
  needToKnow: string[]; // Subject areas user has access to
}

export interface Permission {
  id: string;
  resource: string; // e.g., 'intelligence', 'sources', 'alerts'
  actions: Action[]; // e.g., 'read', 'write', 'delete', 'share'
  conditions?: PermissionCondition[];
}

export interface Restriction {
  type: 'TIME' | 'LOCATION' | 'NETWORK' | 'DEVICE';
  parameters: Record<string, any>;
}

// Predefined roles for tactical intelligence
export const TACTICAL_ROLES: UserRole[] = [
  {
    id: 'intelligence-analyst',
    name: 'Intelligence Analyst',
    clearanceLevel: 'SECRET',
    permissions: [
      {
        id: 'read-intelligence',
        resource: 'intelligence',
        actions: ['read', 'analyze', 'annotate'],
        conditions: [
          { type: 'classification', operator: 'lte', value: 'SECRET' }
        ]
      },
      {
        id: 'manage-sources',
        resource: 'sources',
        actions: ['read', 'add', 'update'],
        conditions: [
          { type: 'category', operator: 'in', value: ['OSINT', 'HUMINT'] }
        ]
      }
    ],
    restrictions: [
      {
        type: 'TIME',
        parameters: { allowedHours: [6, 22] } // 6 AM to 10 PM
      }
    ],
    needToKnow: ['tactical-operations', 'threat-assessment']
  },
  {
    id: 'operations-commander',
    name: 'Operations Commander',
    clearanceLevel: 'TOP_SECRET',
    permissions: [
      {
        id: 'full-intelligence-access',
        resource: 'intelligence',
        actions: ['read', 'write', 'delete', 'share', 'classify'],
        conditions: []
      },
      {
        id: 'command-control',
        resource: 'operations',
        actions: ['read', 'write', 'execute', 'authorize'],
        conditions: []
      }
    ],
    restrictions: [],
    needToKnow: ['*'] // Access to all subject areas
  },
  {
    id: 'watch-officer',
    name: 'Watch Officer',
    clearanceLevel: 'CONFIDENTIAL',
    permissions: [
      {
        id: 'monitor-intelligence',
        resource: 'intelligence',
        actions: ['read', 'acknowledge'],
        conditions: [
          { type: 'classification', operator: 'lte', value: 'CONFIDENTIAL' },
          { type: 'priority', operator: 'gte', value: 'MEDIUM' }
        ]
      }
    ],
    restrictions: [
      {
        type: 'TIME',
        parameters: { shiftBased: true }
      }
    ],
    needToKnow: ['current-operations']
  }
];
```

## Security Service Implementation

### 1. Access Control Service

```typescript
// AccessControlService.ts
export class AccessControlService {
  private roleCache: Map<string, UserRole> = new Map();
  private permissionCache: Map<string, Permission[]> = new Map();
  private auditLogger: AuditLogger;
  
  constructor() {
    this.auditLogger = new AuditLogger();
  }
  
  async validateAccess(
    userId: string,
    resource: string,
    action: string,
    context?: AccessContext
  ): Promise<AccessResult> {
    const startTime = performance.now();
    
    try {
      // 1. Get user role and clearance
      const userRole = await this.getUserRole(userId);
      if (!userRole) {
        return this.denyAccess('USER_NOT_FOUND', userId, resource, action);
      }
      
      // 2. Check basic permissions
      const hasPermission = this.checkPermission(userRole, resource, action);
      if (!hasPermission) {
        return this.denyAccess('INSUFFICIENT_PERMISSIONS', userId, resource, action);
      }
      
      // 3. Validate classification access
      if (context?.classification) {
        const canAccessClassification = this.validateClassificationAccess(
          userRole.clearanceLevel,
          context.classification
        );
        if (!canAccessClassification) {
          return this.denyAccess('INSUFFICIENT_CLEARANCE', userId, resource, action);
        }
      }
      
      // 4. Check need-to-know
      if (context?.needToKnow) {
        const hasNeedToKnow = this.validateNeedToKnow(userRole, context.needToKnow);
        if (!hasNeedToKnow) {
          return this.denyAccess('NO_NEED_TO_KNOW', userId, resource, action);
        }
      }
      
      // 5. Validate restrictions (time, location, etc.)
      const restrictionCheck = await this.validateRestrictions(userRole, context);
      if (!restrictionCheck.allowed) {
        return this.denyAccess(restrictionCheck.reason, userId, resource, action);
      }
      
      // 6. Log successful access
      await this.auditLogger.logAccess({
        userId,
        resource,
        action,
        result: 'GRANTED',
        timestamp: new Date(),
        duration: performance.now() - startTime,
        context
      });
      
      return {
        allowed: true,
        reason: 'ACCESS_GRANTED',
        permissions: this.getResourcePermissions(userRole, resource),
        restrictions: userRole.restrictions
      };
      
    } catch (error) {
      await this.auditLogger.logError({
        userId,
        resource,
        action,
        error: error.message,
        timestamp: new Date()
      });
      
      return this.denyAccess('SYSTEM_ERROR', userId, resource, action);
    }
  }
  
  private checkPermission(role: UserRole, resource: string, action: string): boolean {
    return role.permissions.some(permission => 
      permission.resource === resource &&
      permission.actions.includes(action as Action) &&
      this.evaluateConditions(permission.conditions || [], role)
    );
  }
  
  private validateClassificationAccess(
    userClearance: ClassificationLevel,
    requiredClassification: ClassificationLevel
  ): boolean {
    return CLASSIFICATION_HIERARCHY[userClearance] >= CLASSIFICATION_HIERARCHY[requiredClassification];
  }
  
  private validateNeedToKnow(role: UserRole, requiredNeedToKnow: string[]): boolean {
    if (role.needToKnow.includes('*')) return true;
    
    return requiredNeedToKnow.every(need => 
      role.needToKnow.includes(need)
    );
  }
  
  private async validateRestrictions(
    role: UserRole,
    context?: AccessContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    for (const restriction of role.restrictions) {
      const isValid = await this.checkRestriction(restriction, context);
      if (!isValid.allowed) {
        return isValid;
      }
    }
    return { allowed: true };
  }
  
  private denyAccess(
    reason: string,
    userId: string,
    resource: string,
    action: string
  ): AccessResult {
    this.auditLogger.logAccess({
      userId,
      resource,
      action,
      result: 'DENIED',
      reason,
      timestamp: new Date()
    });
    
    return {
      allowed: false,
      reason,
      permissions: [],
      restrictions: []
    };
  }
}
```

### 2. Encryption Service

```typescript
// EncryptionService.ts
export class EncryptionService {
  private keyManager: KeyManager;
  private algorithm: string = 'AES-256-GCM';
  
  constructor() {
    this.keyManager = new KeyManager();
  }
  
  async encryptIntelligence(
    item: IntelligenceItem,
    classification: ClassificationLevel
  ): Promise<EncryptedIntelligence> {
    const encryptionKey = await this.keyManager.getKeyForClassification(classification);
    
    // Encrypt sensitive fields
    const encryptedContent = await this.encrypt(item.content, encryptionKey);
    const encryptedLocation = item.location ? 
      await this.encrypt(JSON.stringify(item.location), encryptionKey) : undefined;
    
    // Create encrypted intelligence object
    const encrypted: EncryptedIntelligence = {
      id: item.id,
      encryptedContent,
      encryptedLocation,
      metadata: {
        algorithm: this.algorithm,
        classification,
        encryptedAt: new Date(),
        keyId: encryptionKey.id
      },
      // Keep unclassified metadata unencrypted for filtering/searching
      sourceId: item.sourceId,
      timestamp: item.timestamp,
      category: item.category,
      priority: item.priority
    };
    
    return encrypted;
  }
  
  async decryptIntelligence(
    encrypted: EncryptedIntelligence,
    userClearance: ClassificationLevel
  ): Promise<IntelligenceItem | null> {
    // Check if user can access this classification level
    if (!this.canAccessClassification(userClearance, encrypted.metadata.classification)) {
      return null;
    }
    
    const decryptionKey = await this.keyManager.getKey(encrypted.metadata.keyId);
    
    const content = await this.decrypt(encrypted.encryptedContent, decryptionKey);
    const location = encrypted.encryptedLocation ? 
      JSON.parse(await this.decrypt(encrypted.encryptedLocation, decryptionKey)) : undefined;
    
    return {
      id: encrypted.id,
      sourceId: encrypted.sourceId,
      content,
      location,
      timestamp: encrypted.timestamp,
      category: encrypted.category,
      priority: encrypted.priority,
      classification: encrypted.metadata.classification,
      // ... other decrypted fields
    };
  }
  
  private async encrypt(data: string, key: EncryptionKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key.keyData,
      { name: this.algorithm },
      false,
      ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
      { name: this.algorithm, iv },
      cryptoKey,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  private async decrypt(encryptedData: string, key: EncryptionKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key.keyData,
      { name: this.algorithm },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: this.algorithm, iv },
      cryptoKey,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }
}
```

### 3. Audit Logging Service

```typescript
// AuditLogger.ts
export class AuditLogger {
  private logQueue: AuditLogEntry[] = [];
  private batchSize: number = 100;
  private flushInterval: number = 30000; // 30 seconds
  
  constructor() {
    setInterval(() => this.flushLogs(), this.flushInterval);
  }
  
  async logAccess(entry: AccessLogEntry): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: generateUUID(),
      type: 'ACCESS',
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      result: entry.result,
      timestamp: entry.timestamp,
      ipAddress: await this.getUserIP(entry.userId),
      userAgent: await this.getUserAgent(entry.userId),
      sessionId: await this.getSessionId(entry.userId),
      classification: entry.context?.classification,
      metadata: {
        duration: entry.duration,
        reason: entry.reason,
        context: entry.context
      }
    };
    
    this.addToQueue(auditEntry);
    
    // Immediate flush for denied access or high classification
    if (entry.result === 'DENIED' || 
        (entry.context?.classification && 
         CLASSIFICATION_HIERARCHY[entry.context.classification] >= CLASSIFICATION_HIERARCHY['SECRET'])) {
      await this.flushLogs();
    }
  }
  
  async logDataAccess(entry: DataAccessLogEntry): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: generateUUID(),
      type: 'DATA_ACCESS',
      userId: entry.userId,
      action: 'READ',
      resource: entry.dataType,
      result: 'SUCCESS',
      timestamp: new Date(),
      classification: entry.classification,
      metadata: {
        dataId: entry.dataId,
        fieldsAccessed: entry.fieldsAccessed,
        purpose: entry.purpose
      }
    };
    
    this.addToQueue(auditEntry);
  }
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEntry: AuditLogEntry = {
      id: generateUUID(),
      type: 'SECURITY_EVENT',
      userId: event.userId,
      action: event.eventType,
      resource: 'system',
      result: event.severity,
      timestamp: event.timestamp,
      metadata: {
        description: event.description,
        severity: event.severity,
        source: event.source,
        remediation: event.remediation
      }
    };
    
    this.addToQueue(auditEntry);
    
    // Immediate flush for high severity events
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      await this.flushLogs();
      await this.triggerSecurityAlert(event);
    }
  }
  
  private addToQueue(entry: AuditLogEntry): void {
    this.logQueue.push(entry);
    
    if (this.logQueue.length >= this.batchSize) {
      this.flushLogs();
    }
  }
  
  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;
    
    const batch = [...this.logQueue];
    this.logQueue = [];
    
    try {
      await this.persistLogs(batch);
    } catch (error) {
      console.error('Failed to persist audit logs:', error);
      // Re-queue failed logs
      this.logQueue.unshift(...batch);
    }
  }
  
  private async persistLogs(logs: AuditLogEntry[]): Promise<void> {
    // In production, this would write to a secure, tamper-proof log store
    // For now, encrypt and store in localStorage with additional backup
    const encryptedLogs = await this.encryptLogs(logs);
    
    const existingLogs = this.getStoredLogs();
    const allLogs = [...existingLogs, ...encryptedLogs];
    
    localStorage.setItem('audit_logs', JSON.stringify(allLogs));
    
    // Also send to remote audit server if configured
    if (this.hasRemoteAuditServer()) {
      await this.sendToRemoteServer(encryptedLogs);
    }
  }
}
```

## UI Security Components

### 1. Classification Display Components

```typescript
// ClassificationBanner.tsx
export const ClassificationBanner: React.FC<{
  level: ClassificationLevel;
  caveats?: string[];
  position?: 'top' | 'bottom' | 'both';
}> = ({ level, caveats = [], position = 'both' }) => {
  const bannerClass = `classification-banner classification-${level.toLowerCase()}`;
  const displayText = [level, ...caveats].join(' // ');
  
  const Banner = () => (
    <div className={bannerClass}>
      <span className="classification-text">{displayText}</span>
    </div>
  );
  
  return (
    <>
      {(position === 'top' || position === 'both') && <Banner />}
      {(position === 'bottom' || position === 'both') && <Banner />}
    </>
  );
};

// ClassificationIndicator.tsx
export const ClassificationIndicator: React.FC<{
  level: ClassificationLevel;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}> = ({ level, size = 'medium', showIcon = true }) => {
  return (
    <span className={`classification-indicator classification-${level.toLowerCase()} size-${size}`}>
      {showIcon && <SecurityIcon level={level} />}
      <span className="classification-label">{level}</span>
    </span>
  );
};
```

### 2. Secure Data Display Components

```typescript
// SecureIntelCard.tsx
export const SecureIntelCard: React.FC<{
  item: SecureIntelligenceItem;
  userClearance: ClassificationLevel;
  userRole: UserRole;
}> = ({ item, userClearance, userRole }) => {
  const [decryptedItem, setDecryptedItem] = useState<IntelligenceItem | null>(null);
  const [accessGranted, setAccessGranted] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      const accessResult = await accessControlService.validateAccess(
        userRole.id,
        'intelligence',
        'read',
        {
          classification: item.classification.level,
          needToKnow: item.tags
        }
      );
      
      setAccessGranted(accessResult.allowed);
      
      if (accessResult.allowed) {
        const decrypted = await encryptionService.decryptIntelligence(item, userClearance);
        setDecryptedItem(decrypted);
      }
    };
    
    checkAccess();
  }, [item, userClearance, userRole]);
  
  if (!accessGranted) {
    return (
      <div className="intel-card access-denied">
        <ClassificationIndicator level={item.classification.level} />
        <div className="access-denied-message">
          <SecurityIcon name="lock" />
          <span>Access Denied - Insufficient Clearance</span>
        </div>
      </div>
    );
  }
  
  if (!decryptedItem) {
    return (
      <div className="intel-card loading">
        <LoadingSpinner />
        <span>Decrypting...</span>
      </div>
    );
  }
  
  return (
    <div className={`intel-card classification-${item.classification.level.toLowerCase()}`}>
      <ClassificationIndicator level={item.classification.level} />
      <div className="intel-content">
        <h3>{decryptedItem.title}</h3>
        <RedactedContent 
          content={decryptedItem.content}
          userClearance={userClearance}
          classification={item.classification.level}
        />
      </div>
      <SecurityFooter item={item} />
    </div>
  );
};

// RedactedContent.tsx
export const RedactedContent: React.FC<{
  content: string;
  userClearance: ClassificationLevel;
  classification: ClassificationLevel;
}> = ({ content, userClearance, classification }) => {
  const [processedContent, setProcessedContent] = useState<string>('');
  
  useEffect(() => {
    const processContent = async () => {
      if (CLASSIFICATION_HIERARCHY[userClearance] >= CLASSIFICATION_HIERARCHY[classification]) {
        setProcessedContent(content);
      } else {
        // Apply redaction based on clearance level
        const redacted = await redactionService.redactContent(content, userClearance);
        setProcessedContent(redacted);
      }
    };
    
    processContent();
  }, [content, userClearance, classification]);
  
  return (
    <div className="redacted-content">
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </div>
  );
};
```

## Security Configuration

### 1. Environment Security Settings

```typescript
// SecurityConfig.ts
export interface SecurityConfiguration {
  encryption: {
    algorithm: string;
    keyRotationInterval: number; // hours
    keyStrength: number; // bits
  };
  session: {
    timeout: number; // minutes
    maxConcurrentSessions: number;
    requireReauth: boolean;
  };
  audit: {
    logLevel: 'minimal' | 'standard' | 'detailed';
    retentionPeriod: number; // days
    realTimeAlerting: boolean;
  };
  access: {
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireTwoFactor: boolean;
  };
  classification: {
    defaultLevel: ClassificationLevel;
    autoClassification: boolean;
    caveatHandling: boolean;
  };
}

export const getSecurityConfig = (): SecurityConfiguration => {
  const env = process.env.NODE_ENV;
  
  const baseConfig: SecurityConfiguration = {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotationInterval: 24,
      keyStrength: 256
    },
    session: {
      timeout: 30,
      maxConcurrentSessions: 3,
      requireReauth: true
    },
    audit: {
      logLevel: 'standard',
      retentionPeriod: 2555, // 7 years
      realTimeAlerting: true
    },
    access: {
      maxFailedAttempts: 3,
      lockoutDuration: 15,
      requireTwoFactor: false
    },
    classification: {
      defaultLevel: 'UNCLASSIFIED',
      autoClassification: false,
      caveatHandling: true
    }
  };
  
  if (env === 'production') {
    return {
      ...baseConfig,
      session: {
        ...baseConfig.session,
        timeout: 15 // Shorter timeout in production
      },
      access: {
        ...baseConfig.access,
        requireTwoFactor: true // Always require 2FA in production
      },
      audit: {
        ...baseConfig.audit,
        logLevel: 'detailed' // More detailed logging in production
      }
    };
  }
  
  return baseConfig;
};
```

This security implementation provides comprehensive protection for classified intelligence while maintaining operational efficiency and user experience. The multi-layered approach ensures defense in depth while the role-based access control provides fine-grained permissions management.
