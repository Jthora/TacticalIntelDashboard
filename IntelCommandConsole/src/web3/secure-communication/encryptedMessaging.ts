import { BrowserProvider, ethers } from 'ethers';
import { encrypt, decrypt } from '@metamask/eth-sig-util';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Utility functions for secure communication between Earth Alliance operatives
 * Implements end-to-end encrypted messaging and secure channels
 */

// Get public key from address (in a real app, this would use a key registry)
export const getPublicKey = async (
  address: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    // In a production environment, this would fetch from a key registry contract
    // For now, we'll simulate a registry lookup with the provider
    const request = {
      method: 'eth_getEncryptionPublicKey',
      params: [address]
    };
    
    // This is a simulated response - in production, this would be a real request
    // to a blockchain-based key registry or directly to the user's wallet
    return await provider.send(request.method, request.params);
  } catch (error) {
    console.error('Error fetching public key:', error);
    throw new Error('Failed to get encryption public key');
  }
};

/**
 * Encrypts a message using the recipient's public key
 * @param message The message to encrypt
 * @param recipientAddress The recipient's address
 * @param provider The Ethereum provider
 * @returns The encrypted message
 */
export const encryptMessage = async (
  message: string,
  recipientAddress: string,
  provider: BrowserProvider
): Promise<string> => {
  try {
    // Get recipient's public key from the registry
    const publicKey = await getPublicKey(recipientAddress, provider);
    
    // Encrypt the message using recipient's public key
    const encryptedMessage = encrypt({
      publicKey,
      data: JSON.stringify({ 
        text: message, 
        date: new Date().toISOString(),
        sender: await (await provider.getSigner()).getAddress()
      }),
      version: 'x25519-xsalsa20-poly1305'
    });
    
    return JSON.stringify(encryptedMessage);
  } catch (error) {
    console.error('Error encrypting message:', error);
    throw new Error('Failed to encrypt message');
  }
};

/**
 * Decrypts a message using the local private key
 * @param encryptedMessage The encrypted message
 * @param provider The Ethereum provider
 * @returns The decrypted message
 */
export const decryptMessage = async (
  encryptedMessage: string,
  provider: BrowserProvider
): Promise<{ text: string; date: string; sender: string }> => {
  try {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Request decryption from the connected wallet
    const decrypted = await provider.send('eth_decrypt', [encryptedMessage, address]);
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting message:', error);
    throw new Error('Failed to decrypt message');
  }
};

// Generate random encryption key for channel
export const generateRandomKey = (): string => {
  return randomBytes(32).toString('hex');
};

// Interface for channel message
export interface ChannelMessage {
  id: string;
  sender: string;
  content: string; // Encrypted
  timestamp: number;
  expiresAt?: number;
  readReceipts?: string[]; // Addresses of readers
}

// Interface for channel metadata
export interface ChannelMetadata {
  id?: string;
  name: string;
  participants: string[];
  encryptedKeys: {
    participant: string;
    encryptedKey: string;
  }[];
  createdAt: number;
  createdBy: string;
  lastUpdated?: number;
}

/**
 * Creates a secure communication channel
 * @param name The name of the channel
 * @param participants The participant addresses
 * @param provider The Ethereum provider
 * @returns The channel ID and encryption key
 */
export const createSecureChannel = async (
  name: string,
  participants: string[],
  provider: BrowserProvider
): Promise<{ channelId: string; key: string }> => {
  try {
    // Generate channel encryption key
    const channelKey = generateRandomKey();
    
    // Ensure the creator is included in participants
    const signer = await provider.getSigner();
    const creatorAddress = await signer.getAddress();
    if (!participants.includes(creatorAddress)) {
      participants.push(creatorAddress);
    }
    
    // Encrypt channel key for each participant
    const encryptedKeys = await Promise.all(
      participants.map(async (participant) => {
        const encryptedKey = await encryptMessage(
          channelKey,
          participant,
          provider
        );
        
        return {
          participant,
          encryptedKey
        };
      })
    );
    
    // Store channel metadata (in Phase 3, this would be on a decentralized store)
    const channelMetadata: ChannelMetadata = {
      name,
      participants,
      encryptedKeys,
      createdAt: Date.now(),
      createdBy: creatorAddress
    };
    
    // In a real implementation, this would store the data on IPFS or another decentralized storage
    const channelId = await storeChannel(channelMetadata);
    
    return {
      channelId,
      key: channelKey
    };
  } catch (error) {
    console.error('Error creating secure channel:', error);
    throw new Error('Failed to create secure channel');
  }
};

/**
 * Sends a message to a secure channel
 * @param channelId The channel ID
 * @param message The message to send
 * @param channelKey The channel encryption key
 * @param expiresIn Optional expiry time in milliseconds
 * @param provider The Ethereum provider
 * @returns The message ID
 */
export const sendChannelMessage = async (
  channelId: string,
  message: string,
  channelKey: string,
  expiresIn: number | null,
  provider: BrowserProvider
): Promise<string> => {
  try {
    const signer = await provider.getSigner();
    const senderAddress = await signer.getAddress();
    
    // Encrypt message with channel key
    const encryptedContent = await symmetricEncrypt(message, channelKey);
    
    const now = Date.now();
    const messageId = `${channelId}-${senderAddress.substring(2, 10)}-${now}`;
    
    const channelMessage: ChannelMessage = {
      id: messageId,
      sender: senderAddress,
      content: encryptedContent,
      timestamp: now,
      expiresAt: expiresIn ? now + expiresIn : undefined,
      readReceipts: []
    };
    
    // Store the message in decentralized storage
    await storeChannelMessage(channelId, channelMessage);
    
    return messageId;
  } catch (error) {
    console.error('Error sending channel message:', error);
    throw new Error('Failed to send channel message');
  }
};

/**
 * Gets messages from a secure channel
 * @param channelId The channel ID
 * @param channelKey The channel encryption key
 * @param since Optional timestamp to get messages after
 * @param provider The Ethereum provider
 * @returns The decrypted messages
 */
export const getChannelMessages = async (
  channelId: string,
  channelKey: string,
  since?: number,
  provider?: BrowserProvider
): Promise<{
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  expiresAt?: number;
  isRead: boolean;
}[]> => {
  try {
    // Fetch messages from decentralized storage
    const messages = await fetchChannelMessages(channelId, since);
    
    const currentTime = Date.now();
    let readerAddress: string | undefined;
    
    if (provider) {
      const signer = await provider.getSigner();
      readerAddress = await signer.getAddress();
    }
    
    // Process and decrypt messages
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        // Skip expired messages
        if (message.expiresAt && message.expiresAt < currentTime) {
          return null;
        }
        
        // Decrypt the message content
        const decryptedText = await symmetricDecrypt(message.content, channelKey);
        
        // Check if message is read by the current user
        let isRead = false;
        if (readerAddress) {
          isRead = message.readReceipts?.includes(readerAddress) || false;
          
          // Mark as read if not already read
          if (!isRead) {
            await markMessageAsRead(channelId, message.id, readerAddress);
          }
        }
        
        return {
          id: message.id,
          text: decryptedText,
          sender: message.sender,
          timestamp: message.timestamp,
          expiresAt: message.expiresAt,
          isRead
        };
      })
    );
    
    // Filter out null messages (expired ones)
    return decryptedMessages.filter(message => message !== null) as {
      id: string;
      text: string;
      sender: string;
      timestamp: number;
      expiresAt?: number;
      isRead: boolean;
    }[];
  } catch (error) {
    console.error('Error getting channel messages:', error);
    throw new Error('Failed to get channel messages');
  }
};

/**
 * Gets channel metadata
 * @param channelId The channel ID
 * @param provider The Ethereum provider
 * @returns The channel metadata
 */
export const getChannelMetadata = async (
  channelId: string,
  provider: BrowserProvider
): Promise<ChannelMetadata> => {
  try {
    // In a real implementation, this would fetch from IPFS or another decentralized storage
    const metadata = await fetchChannelMetadata(channelId);
    
    if (!metadata) {
      throw new Error(`Channel ${channelId} not found`);
    }
    
    return metadata;
  } catch (error) {
    console.error(`Error getting channel metadata for ${channelId}:`, error);
    throw new Error('Failed to get channel metadata');
  }
};

/**
 * Gets the decryption key for a channel (if the user is a participant)
 * @param channelId The channel ID
 * @param provider The Ethereum provider
 * @returns The decryption key or null if user is not a participant
 */
export const getChannelKey = async (
  channelId: string,
  provider: BrowserProvider
): Promise<string | null> => {
  try {
    const metadata = await getChannelMetadata(channelId, provider);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    // Find the encrypted key for this user
    const encryptedKeyEntry = metadata.encryptedKeys.find(
      entry => entry.participant.toLowerCase() === userAddress.toLowerCase()
    );
    
    if (!encryptedKeyEntry) {
      return null; // User is not a participant
    }
    
    // Decrypt the channel key
    const decrypted = await decryptMessage(encryptedKeyEntry.encryptedKey, provider);
    return decrypted.text;
  } catch (error) {
    console.error(`Error getting channel key for ${channelId}:`, error);
    throw new Error('Failed to get channel key');
  }
};

/**
 * Adds a participant to a channel
 * @param channelId The channel ID
 * @param participantAddress The new participant's address
 * @param channelKey The channel key
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const addChannelParticipant = async (
  channelId: string,
  participantAddress: string,
  channelKey: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    // Get current metadata
    const metadata = await getChannelMetadata(channelId, provider);
    
    // Check if already a participant
    if (metadata.participants.includes(participantAddress)) {
      return true; // Already a participant
    }
    
    // Encrypt the channel key for the new participant
    const encryptedKey = await encryptMessage(
      channelKey,
      participantAddress,
      provider
    );
    
    // Update metadata
    metadata.participants.push(participantAddress);
    metadata.encryptedKeys.push({
      participant: participantAddress,
      encryptedKey
    });
    metadata.lastUpdated = Date.now();
    
    // Store updated metadata
    await updateChannelMetadata(channelId, metadata);
    
    return true;
  } catch (error) {
    console.error(`Error adding participant ${participantAddress} to channel ${channelId}:`, error);
    throw new Error('Failed to add channel participant');
  }
};

/**
 * Removes a participant from a channel
 * @param channelId The channel ID
 * @param participantAddress The participant's address to remove
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const removeChannelParticipant = async (
  channelId: string,
  participantAddress: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    // Get current metadata
    const metadata = await getChannelMetadata(channelId, provider);
    
    // Verify the requester is the creator
    const signer = await provider.getSigner();
    const requesterAddress = await signer.getAddress();
    
    if (metadata.createdBy.toLowerCase() !== requesterAddress.toLowerCase()) {
      throw new Error('Only the channel creator can remove participants');
    }
    
    // Cannot remove the creator
    if (participantAddress.toLowerCase() === metadata.createdBy.toLowerCase()) {
      throw new Error('Cannot remove the channel creator');
    }
    
    // Update metadata
    metadata.participants = metadata.participants.filter(
      p => p.toLowerCase() !== participantAddress.toLowerCase()
    );
    metadata.encryptedKeys = metadata.encryptedKeys.filter(
      e => e.participant.toLowerCase() !== participantAddress.toLowerCase()
    );
    metadata.lastUpdated = Date.now();
    
    // Store updated metadata
    await updateChannelMetadata(channelId, metadata);
    
    return true;
  } catch (error) {
    console.error(`Error removing participant ${participantAddress} from channel ${channelId}:`, error);
    throw new Error('Failed to remove channel participant');
  }
};

/**
 * Deletes a message from a channel
 * @param channelId The channel ID
 * @param messageId The message ID to delete
 * @param provider The Ethereum provider
 * @returns True if successful
 */
export const deleteChannelMessage = async (
  channelId: string,
  messageId: string,
  provider: BrowserProvider
): Promise<boolean> => {
  try {
    // Get the message
    const message = await getChannelMessage(channelId, messageId);
    
    if (!message) {
      throw new Error(`Message ${messageId} not found in channel ${channelId}`);
    }
    
    // Verify the requester is the sender
    const signer = await provider.getSigner();
    const requesterAddress = await signer.getAddress();
    
    if (message.sender.toLowerCase() !== requesterAddress.toLowerCase()) {
      throw new Error('Only the message sender can delete messages');
    }
    
    // Delete the message
    await removeChannelMessage(channelId, messageId);
    
    return true;
  } catch (error) {
    console.error(`Error deleting message ${messageId} from channel ${channelId}:`, error);
    throw new Error('Failed to delete channel message');
  }
};

// Symmetric encryption/decryption helpers using proper cryptography
async function symmetricEncrypt(message: string, key: string): Promise<string> {
  try {
    // Convert the hex key to a buffer
    const keyBuffer = Buffer.from(key, 'hex');
    
    // Generate a random IV
    const iv = randomBytes(16);
    
    // Create cipher
    const cipher = createCipheriv('aes-256-cbc', keyBuffer.slice(0, 32), iv);
    
    // Encrypt the message
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error in symmetric encryption:', error);
    throw new Error('Encryption failed');
  }
}

async function symmetricDecrypt(encryptedData: string, key: string): Promise<string> {
  try {
    // Split IV and data
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Convert the hex key to a buffer
    const keyBuffer = Buffer.from(key, 'hex');
    
    // Create decipher
    const decipher = createDecipheriv('aes-256-cbc', keyBuffer.slice(0, 32), iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error in symmetric decryption:', error);
    throw new Error('Decryption failed');
  }
}

// Placeholder functions for decentralized storage
// In a real implementation, these would interact with IPFS, Ceramic, or another decentralized storage solution

// Store channel metadata
async function storeChannel(channelMetadata: ChannelMetadata): Promise<string> {
  // Generate a unique channel ID if not provided
  const channelId = channelMetadata.id || `channel-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  
  // In a real implementation, this would store the data on IPFS or Ceramic
  console.log(`Storing channel metadata for ${channelId}:`, channelMetadata);
  
  // For development purposes, we'll simulate storage in localStorage
  if (typeof window !== 'undefined') {
    const storedChannels = JSON.parse(localStorage.getItem('secureChannels') || '{}');
    storedChannels[channelId] = {
      ...channelMetadata,
      id: channelId
    };
    localStorage.setItem('secureChannels', JSON.stringify(storedChannels));
  }
  
  return channelId;
}

// Update channel metadata
async function updateChannelMetadata(channelId: string, metadata: ChannelMetadata): Promise<void> {
  // In a real implementation, this would update the data on IPFS or Ceramic
  console.log(`Updating channel metadata for ${channelId}:`, metadata);
  
  // For development purposes, we'll simulate storage in localStorage
  if (typeof window !== 'undefined') {
    const storedChannels = JSON.parse(localStorage.getItem('secureChannels') || '{}');
    storedChannels[channelId] = {
      ...metadata,
      id: channelId
    };
    localStorage.setItem('secureChannels', JSON.stringify(storedChannels));
  }
}

// Fetch channel metadata
async function fetchChannelMetadata(channelId: string): Promise<ChannelMetadata | null> {
  // In a real implementation, this would fetch the data from IPFS or Ceramic
  console.log(`Fetching channel metadata for ${channelId}`);
  
  // For development purposes, we'll simulate retrieval from localStorage
  if (typeof window !== 'undefined') {
    const storedChannels = JSON.parse(localStorage.getItem('secureChannels') || '{}');
    return storedChannels[channelId] || null;
  }
  
  return null;
}

// Store channel message
async function storeChannelMessage(channelId: string, message: ChannelMessage): Promise<void> {
  // In a real implementation, this would store the data on IPFS or Ceramic
  console.log(`Storing message for channel ${channelId}:`, message);
  
  // For development purposes, we'll simulate storage in localStorage
  if (typeof window !== 'undefined') {
    const key = `channel-${channelId}-messages`;
    const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    storedMessages.push(message);
    localStorage.setItem(key, JSON.stringify(storedMessages));
  }
}

// Get a specific channel message
async function getChannelMessage(channelId: string, messageId: string): Promise<ChannelMessage | null> {
  // In a real implementation, this would fetch the data from IPFS or Ceramic
  console.log(`Fetching message ${messageId} from channel ${channelId}`);
  
  // For development purposes, we'll simulate retrieval from localStorage
  if (typeof window !== 'undefined') {
    const key = `channel-${channelId}-messages`;
    const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    return storedMessages.find((m: ChannelMessage) => m.id === messageId) || null;
  }
  
  return null;
}

// Remove a channel message
async function removeChannelMessage(channelId: string, messageId: string): Promise<void> {
  // In a real implementation, this would update the data on IPFS or Ceramic
  console.log(`Removing message ${messageId} from channel ${channelId}`);
  
  // For development purposes, we'll simulate storage in localStorage
  if (typeof window !== 'undefined') {
    const key = `channel-${channelId}-messages`;
    const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedMessages = storedMessages.filter((m: ChannelMessage) => m.id !== messageId);
    localStorage.setItem(key, JSON.stringify(updatedMessages));
  }
}

// Fetch channel messages
async function fetchChannelMessages(channelId: string, since?: number): Promise<ChannelMessage[]> {
  // In a real implementation, this would fetch the data from IPFS or Ceramic
  console.log(`Fetching messages for channel ${channelId} since ${since || 'beginning'}`);
  
  // For development purposes, we'll simulate retrieval from localStorage
  if (typeof window !== 'undefined') {
    const key = `channel-${channelId}-messages`;
    const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (since) {
      return storedMessages.filter((m: ChannelMessage) => m.timestamp > since);
    }
    
    return storedMessages;
  }
  
  return [];
}

// Mark message as read
async function markMessageAsRead(channelId: string, messageId: string, reader: string): Promise<void> {
  // In a real implementation, this would update the data on IPFS or Ceramic
  console.log(`Marking message ${messageId} as read by ${reader} in channel ${channelId}`);
  
  // For development purposes, we'll simulate storage in localStorage
  if (typeof window !== 'undefined') {
    const key = `channel-${channelId}-messages`;
    const storedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    
    const updatedMessages = storedMessages.map((m: ChannelMessage) => {
      if (m.id === messageId) {
        const readReceipts = m.readReceipts || [];
        if (!readReceipts.includes(reader)) {
          readReceipts.push(reader);
        }
        return { ...m, readReceipts };
      }
      return m;
    });
    
    localStorage.setItem(key, JSON.stringify(updatedMessages));
  }
}
