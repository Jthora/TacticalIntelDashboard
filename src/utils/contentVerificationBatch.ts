// src/utils/contentVerificationBatch.ts
import { BrowserProvider,ethers } from 'ethers';

/**
 * Generate a hash for content
 * @param content - Content to hash
 * @returns Content hash
 */
export const generateContentHash = (content: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(content));
};

// Verification item structure
export interface VerificationItem {
  content: string;
  hash: string;
  timestamp?: number;
  transactionHash?: string;
  blockNumber?: number;
  verified?: boolean;
}

// Batch verification result
export interface BatchVerificationResult {
  totalItems: number;
  verifiedItems: number;
  items: VerificationItem[];
  merkleRoot?: string;
  anchorTransactionHash?: string;
  timestamp?: number;
}

// Content with metadata
export interface ContentWithMetadata {
  id: string;
  content: string;
  title?: string;
  source?: string;
}

/**
 * Generate content hashes for a batch of content items
 * @param contentItems - Array of content items
 * @returns Array of verification items with hashes
 */
export const generateBatchHashes = (
  contentItems: ContentWithMetadata[]
): VerificationItem[] => {
  return contentItems.map(item => ({
    content: item.content,
    hash: generateContentHash(item.content)
  }));
};

/**
 * Generate a Merkle tree from content hashes
 * @param hashes - Array of content hashes
 * @returns Merkle tree root hash
 */
export const generateMerkleRoot = (hashes: string[]): string => {
  if (hashes.length === 0) {
    throw new Error('No hashes provided');
  }
  
  if (hashes.length === 1) {
    return hashes[0];
  }
  
  // Ensure even number of hashes for pairing
  const workingHashes = [...hashes];
  if (workingHashes.length % 2 !== 0) {
    workingHashes.push(workingHashes[workingHashes.length - 1]);
  }
  
  const nextLevel: string[] = [];
  
  // Combine pairs of hashes
  for (let i = 0; i < workingHashes.length; i += 2) {
    const combined = ethers.concat([
      ethers.getBytes(workingHashes[i]),
      ethers.getBytes(workingHashes[i + 1])
    ]);
    const hash = ethers.keccak256(combined);
    nextLevel.push(hash);
  }
  
  // Recursively build the tree
  return generateMerkleRoot(nextLevel);
};

/**
 * Anchor a Merkle root hash on the blockchain
 * @param merkleRoot - Merkle tree root hash
 * @param provider - Ethers.js provider
 * @returns Transaction hash of the anchoring transaction
 */
export const anchorMerkleRoot = async (
  merkleRoot: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    
    // Create a transaction with the Merkle root in the data field
    const tx = await signer.sendTransaction({
      to: ethers.ZeroAddress, // Burn address
      value: ethers.parseEther('0'),
      data: merkleRoot
    });
    
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error anchoring Merkle root:', error);
    throw new Error('Failed to anchor Merkle root on blockchain');
  }
};

/**
 * Verify a batch of content against anchored Merkle root
 * @param items - Array of verification items
 * @param merkleRoot - Merkle tree root hash
 * @param transactionHash - Transaction hash of the anchoring transaction
 * @param provider - Ethers.js provider
 * @returns Batch verification result
 */
export const verifyBatch = async (
  items: VerificationItem[],
  merkleRoot: string,
  transactionHash: string,
  provider: BrowserProvider
): Promise<BatchVerificationResult> => {
  try {
    // Calculate hashes for all items
    const itemsWithHash = items.map(item => ({
      ...item,
      hash: item.hash || generateContentHash(item.content)
    }));
    
    // Calculate Merkle root from the items
    const calculatedRoot = generateMerkleRoot(itemsWithHash.map(item => item.hash));
    
    // Check if the calculated root matches the provided root
    const rootMatches = calculatedRoot === merkleRoot;
    
    // Get transaction details from the blockchain
    const tx = await provider.getTransaction(transactionHash);
    if (!tx || tx.blockNumber === null) {
      throw new Error('Transaction not found or not mined yet');
    }
    
    // Verify the transaction contains the Merkle root
    const txDataMatches = tx.data === merkleRoot;
    
    // Get block details to extract timestamp
    const block = await provider.getBlock(tx.blockNumber);
    if (!block) {
      throw new Error('Block not found');
    }
    
    // Mark items as verified if both checks pass
    const verifiedItems = itemsWithHash.map(item => ({
      ...item,
      verified: rootMatches && txDataMatches,
      blockNumber: Number(tx.blockNumber),
      transactionHash
    }));
    
    return {
      totalItems: items.length,
      verifiedItems: rootMatches && txDataMatches ? items.length : 0,
      items: verifiedItems,
      merkleRoot,
      anchorTransactionHash: transactionHash,
      timestamp: block.timestamp
    };
  } catch (error) {
    console.error('Error verifying batch:', error);
    throw new Error('Failed to verify content batch');
  }
};

/**
 * Generate and anchor a batch of content items
 * @param contentItems - Array of content items
 * @param provider - Ethers.js provider
 * @returns Batch verification result
 */
export const generateAndAnchorBatch = async (
  contentItems: ContentWithMetadata[],
  provider: BrowserProvider
): Promise<BatchVerificationResult> => {
  try {
    // Generate hashes for all content items
    const verificationItems = generateBatchHashes(contentItems);
    
    // Generate Merkle root from the hashes
    const merkleRoot = generateMerkleRoot(verificationItems.map(item => item.hash));
    
    // Anchor the Merkle root on the blockchain
    const txHash = await anchorMerkleRoot(merkleRoot, provider);
    
    // Verify the batch to get the complete result
    return await verifyBatch(verificationItems, merkleRoot, txHash, provider);
  } catch (error) {
    console.error('Error generating and anchoring batch:', error);
    throw new Error('Failed to process content batch');
  }
};
