import bs58 from "bs58";
import type { Result } from "../types/Results";

export interface DoEncryptParams {
	secret: string;
	sharesCount: number;
	sharesThreshold: number;
}

export interface EncryptResult {
	encryptedData: string;
	shares: string[];
}

/**
 * Encrypts a secret and generates Shamir's Secret Sharing shares for the encryption key
 * @param params - Object containing secret, sharesCount, and sharesThreshold
 * @returns Promise containing the encrypted data and shares wrapped in Result
 */
export async function doEncrypt(
	params: DoEncryptParams,
): Promise<Result<EncryptResult>> {
	try {
		const { secret, sharesCount, sharesThreshold } = params;

		const key = await window.crypto.subtle.generateKey(
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"],
		);

		const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
		const plaintext = new TextEncoder().encode(secret);
		const encrypted = await window.crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			plaintext,
		);

		// Concatenate IV and ciphertext for transport
		const encryptedBytes = new Uint8Array(iv.length + encrypted.byteLength);
		encryptedBytes.set(iv, 0);
		encryptedBytes.set(new Uint8Array(encrypted), iv.length);
		const encryptedData = bs58.encode(encryptedBytes);

		const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
		const { split: shamirSplit } = await import("shamir-secret-sharing");
		const shares = await shamirSplit(rawKey, sharesCount, sharesThreshold).then(
			(shares) => shares.map(bs58.encode),
		);

		return {
			success: true,
			data: {
				encryptedData,
				shares,
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error(`Failed to encrypt: ${String(error)}`, { cause: error }),
		};
	}
}
