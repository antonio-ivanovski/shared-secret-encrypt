import bs58 from "bs58";
import type { Result } from "../types/Results";

export interface ShareUrlData {
	encryptedShare: string;
	iv: string;
	salt: string;
}

export interface CreateShareUrlParams {
	share: string;
	password: string;
	baseUrl?: string;
}

export interface DecryptShareUrlParams {
	urlData: ShareUrlData;
	password: string;
}

/**
 * Derives a key from password using PBKDF2
 */
async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password);
	
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		passwordBuffer,
		"PBKDF2",
		false,
		["deriveKey"]
	);
	
	return crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: new Uint8Array(salt),
			iterations: 100000,
			hash: "SHA-256"
		},
		keyMaterial,
		{
			name: "AES-GCM",
			length: 256
		},
		false,
		["encrypt", "decrypt"]
	);
}

/**
 * Encrypts a share with a password and creates a shareable URL
 */
export async function createShareUrl(params: CreateShareUrlParams): Promise<Result<string>> {
	try {
		const { share, password, baseUrl = window.location.origin } = params;
		
		// Generate random salt and IV
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));
		
		// Derive key from password
		const key = await deriveKeyFromPassword(password, salt);
		
		// Encrypt the share
		const shareBuffer = new TextEncoder().encode(share);
		const encryptedBuffer = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			shareBuffer
		);
		
		// Create URL with query parameters
		const encryptedShare = bs58.encode(new Uint8Array(encryptedBuffer));
		const ivString = bs58.encode(iv);
		const saltString = bs58.encode(salt);
		
		const shareUrl = `${baseUrl}/share?s=${encryptedShare}&iv=${ivString}&salt=${saltString}`;
		
		return {
			success: true,
			data: shareUrl
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error(`Failed to create share URL: ${String(error)}`, { cause: error })
		};
	}
}

/**
 * Decrypts a share from URL data using the provided password
 */
export async function decryptShareFromUrl(params: DecryptShareUrlParams): Promise<Result<string>> {
	try {
		const { urlData, password } = params;
		
		// Decode the encrypted data
		const encryptedShare = bs58.decode(urlData.encryptedShare);
		const iv = bs58.decode(urlData.iv);
		const salt = bs58.decode(urlData.salt);
		
		// Derive key from password
		const key = await deriveKeyFromPassword(password, salt);
		
		// Decrypt the share
		const decryptedBuffer = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: new Uint8Array(iv) },
			key,
			new Uint8Array(encryptedShare)
		);
		
		const decryptedShare = new TextDecoder().decode(decryptedBuffer);
		
		return {
			success: true,
			data: decryptedShare
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error : new Error("Invalid password or corrupted share data")
		};
	}
}
