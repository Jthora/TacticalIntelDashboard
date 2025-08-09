// src/services/IntelligenceBridge.ts

import { useIPFS } from '../contexts/IPFSContext';
import { useWeb3 } from '../contexts/Web3Context';
import { decryptContent,encryptContent } from '../utils/encryptionUtils';

/**
 * IntelligenceBridge - Cross-platform intelligence sharing service
 * Leverages existing IPFS and Web3 infrastructure for seamless integration
 */
export interface IntelligenceMetadata {
  id: string;
  timestamp: string;
  title: string;
  source: string;
  formats: {
    tid?: string; // IPFS hash for TID format
    ime?: string; // IPFS hash for IME format
  };
  verification: {
    signature: string;
    signer: string;
    contract?: string;
  };
  encryption?: {
    encrypted: boolean;
    accessLevel: number;
    tidMetadata?: any;
    imeMetadata?: any;
  };
}

export interface TIDIntelligenceFormat {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  source: {
    name: string;
    url: string;
    category: string;
  };
  metadata: {
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  };
}

export interface IMEIntelligenceFormat {
  report_id: string;
  created_at: string;
  title: string;
  content: {
    summary: string;
    details: string;
    sources: string[];
  };
  classification: {
    level: string;
    category: string;
    tags: string[];
  };
  verification: {
    confidence_score: number;
    verified_by: string[];
    verification_timestamp: string;
  };
}

export class IntelligenceBridge {
  private ipfs: any;
  private web3: any;

  constructor(ipfsContext: any, web3Context: any) {
    this.ipfs = ipfsContext;
    this.web3 = web3Context;
  }

  /**
   * Convert TID format to IME format
   */
  private convertTIDToIME(tidData: TIDIntelligenceFormat): IMEIntelligenceFormat {
    return {
      report_id: tidData.id,
      created_at: tidData.timestamp,
      title: tidData.title,
      content: {
        summary: this.extractSummary(tidData.content),
        details: tidData.content,
        sources: [tidData.source.url]
      },
      classification: {
        level: this.mapPriorityToLevel(tidData.metadata.priority),
        category: tidData.source.category,
        tags: tidData.metadata.tags
      },
      verification: {
        confidence_score: tidData.metadata.confidence,
        verified_by: [tidData.source.name],
        verification_timestamp: tidData.timestamp
      }
    };
  }

  /**
   * Convert IME format to TID format  
   */
  private convertIMEToTID(imeData: IMEIntelligenceFormat): TIDIntelligenceFormat {
    return {
      id: imeData.report_id,
      timestamp: imeData.created_at,
      title: imeData.title,
      content: imeData.content.details,
      source: {
        name: imeData.verification.verified_by[0] || 'Unknown',
        url: imeData.content.sources[0] || '',
        category: imeData.classification.category
      },
      metadata: {
        tags: imeData.classification.tags,
        priority: this.mapLevelToPriority(imeData.classification.level),
        confidence: imeData.verification.confidence_score
      }
    };
  }

  /**
   * Publish intelligence in both TID and IME formats to IPFS
   */
  async publishIntelligence(
    tidData: TIDIntelligenceFormat,
    options: {
      encrypt?: boolean;
      accessLevel?: number;
      pinToMultipleServices?: boolean;
    } = {}
  ): Promise<string> {
    try {
      if (!this.web3.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Convert to IME format
      const imeData = this.convertTIDToIME(tidData);

      // Prepare content for upload
      let tidContent = JSON.stringify(tidData);
      let imeContent = JSON.stringify(imeData);

      // Encrypt if requested
      let tidEncryptionMetadata = null;
      let imeEncryptionMetadata = null;
      if (options.encrypt && this.web3.provider) {
        const tidEncrypted = await encryptContent(tidContent, this.web3.provider);
        const imeEncrypted = await encryptContent(imeContent, this.web3.provider);
        tidContent = tidEncrypted.encryptedContent;
        imeContent = imeEncrypted.encryptedContent;
        tidEncryptionMetadata = tidEncrypted.metadata;
        imeEncryptionMetadata = imeEncrypted.metadata;
      }

      // Upload both formats to IPFS
      const tidHash = await this.ipfs.uploadContent(tidContent);
      const imeHash = await this.ipfs.uploadContent(imeContent);

      // Create metadata
      const metadata: IntelligenceMetadata = {
        id: tidData.id,
        timestamp: tidData.timestamp,
        title: tidData.title,
        source: tidData.source.name,
        formats: {
          tid: tidHash,
          ime: imeHash
        },
        verification: {
          signature: await this.signMetadata(tidData),
          signer: this.web3.walletAddress
        },
        encryption: options.encrypt ? {
          encrypted: true,
          accessLevel: options.accessLevel || 0,
          tidMetadata: tidEncryptionMetadata,
          imeMetadata: imeEncryptionMetadata
        } : undefined
      };

      // Upload metadata
      const metadataHash = await this.ipfs.uploadContent(JSON.stringify(metadata));

      // Pin to multiple services if requested
      if (options.pinToMultipleServices) {
        await this.pinToServices([tidHash, imeHash, metadataHash]);
      }

      return metadataHash;
    } catch (error) {
      console.error('Failed to publish intelligence:', error);
      throw error;
    }
  }

  /**
   * Retrieve intelligence in specified format
   */
  async getIntelligence(
    metadataHash: string,
    format: 'tid' | 'ime' = 'tid'
  ): Promise<TIDIntelligenceFormat | IMEIntelligenceFormat> {
    try {
      // Get metadata
      const metadataContent = await this.ipfs.getContent(metadataHash);
      const metadata: IntelligenceMetadata = JSON.parse(metadataContent);

      // Get content in requested format
      const contentHash = metadata.formats[format];
      if (!contentHash) {
        throw new Error(`Format ${format} not available for this intelligence`);
      }

      let content = await this.ipfs.getContent(contentHash);

      // Decrypt if encrypted
      if (metadata.encryption?.encrypted && this.web3.provider) {
        const encryptionMetadata = format === 'tid' 
          ? metadata.encryption.tidMetadata 
          : metadata.encryption.imeMetadata;
        if (encryptionMetadata) {
          content = await decryptContent(content, encryptionMetadata, this.web3.provider);
        }
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to retrieve intelligence:', error);
      throw error;
    }
  }

  /**
   * List available intelligence with metadata
   */
  async listIntelligence(filter?: {
    source?: string;
    tags?: string[];
    timeRange?: { start: string; end: string };
  }): Promise<IntelligenceMetadata[]> {
    // This would integrate with your existing feed or storage system
    // For now, return empty array - implement based on your storage strategy
    return [];
  }

  /**
   * Verify intelligence signature
   */
  async verifyIntelligence(metadataHash: string): Promise<boolean> {
    try {
      const metadataContent = await this.ipfs.getContent(metadataHash);
      const metadata: IntelligenceMetadata = JSON.parse(metadataContent);

      // Verify signature using existing Web3 utilities
      // Implementation depends on your signature verification logic
      return true; // Placeholder
    } catch (error) {
      console.error('Failed to verify intelligence:', error);
      return false;
    }
  }

  // Private helper methods
  private async signMetadata(data: TIDIntelligenceFormat): Promise<string> {
    if (!this.web3.signer) {
      throw new Error('No signer available');
    }

    const message = `${data.id}:${data.timestamp}:${data.title}`;
    return await this.web3.signMessage(message);
  }

  private async pinToServices(hashes: string[]): Promise<void> {
    // Use existing pinning service utilities
    for (const hash of hashes) {
      try {
        await this.ipfs.pinContent(hash);
      } catch (error) {
        console.warn(`Failed to pin ${hash}:`, error);
      }
    }
  }

  private extractSummary(content: string): string {
    // Simple summary extraction - first 200 chars
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  private mapPriorityToLevel(priority: string): string {
    const mapping: { [key: string]: string } = {
      'low': 'unclassified',
      'medium': 'confidential',
      'high': 'secret',
      'critical': 'top_secret'
    };
    return mapping[priority] || 'unclassified';
  }

  private mapLevelToPriority(level: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: { [key: string]: 'low' | 'medium' | 'high' | 'critical' } = {
      'unclassified': 'low',
      'confidential': 'medium',
      'secret': 'high',
      'top_secret': 'critical'
    };
    return mapping[level] || 'low';
  }
}

// Hook for using the intelligence bridge
export const useIntelligenceBridge = () => {
  const ipfsContext = useIPFS();
  const web3Context = useWeb3();

  const bridge = new IntelligenceBridge(ipfsContext, web3Context);

  return {
    publishIntelligence: bridge.publishIntelligence.bind(bridge),
    getIntelligence: bridge.getIntelligence.bind(bridge),
    listIntelligence: bridge.listIntelligence.bind(bridge),
    verifyIntelligence: bridge.verifyIntelligence.bind(bridge),
    isReady: ipfsContext.isConnected && web3Context.isConnected
  };
};
