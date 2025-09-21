import bs58 from "bs58";
import type { Result } from "../types/Results";

export interface DoDecryptParams {
	encryptedData: string;
	shares: string[];
}

/**
 * Decrypts an encrypted secret using Shamir's Secret Sharing shares
 * @param params - Object containing encrypted data, shares, and threshold
 * @returns Promise containing the decrypted secret wrapped in Result
 */
export async function doDecrypt(
	params: DoDecryptParams,
): Promise<Result<string>> {
	try {
		const { encryptedData, shares } = params;

		const validShares = shares.filter((share) => share.trim() !== "");

		const { combine: shamirCombine } = await import("shamir-secret-sharing");
		const keyBytes = await shamirCombine(validShares.map(bs58.decode));
		const key = await crypto.subtle.importKey(
			"raw",
			new Uint8Array(keyBytes),
			{ name: "AES-GCM" },
			true,
			["encrypt", "decrypt"],
		);

		const encryptedInput = new Uint8Array(bs58.decode(encryptedData));
		const iv = encryptedInput.slice(0, 12); // First 12 bytes are IV
		const ciphertext = encryptedInput.slice(12);

		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			ciphertext,
		);

		const decryptedText = new TextDecoder().decode(decrypted);

		return {
			success: true,
			data: decryptedText,
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error(`Failed to decrypt secret: ${String(error)}`, {
							cause: error,
						}),
		};
	}
}
