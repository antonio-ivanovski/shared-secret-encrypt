import { useRef, useState } from "react";
import { combine } from "shamir-secret-sharing";
import bs58 from "bs58";

interface DecryptSecretProps {
	sharesThreshold: number;
	availableShares: string[];
}

export function DecryptSecret({ sharesThreshold, availableShares }: DecryptSecretProps) {
	const decryptInputRef = useRef<HTMLTextAreaElement>(null);
	const [decryptOutput, setDecryptOutput] = useState<string>("");
	const [selectedShares, setSelectedShares] = useState<string[]>(
		new Array(sharesThreshold).fill("")
	);

	const handleShareChange = (index: number, value: string) => {
		const newShares = [...selectedShares];
		newShares[index] = value;
		setSelectedShares(newShares);
	};

	const doDecrypt = async () => {
		try {
			const validShares = selectedShares.filter(share => share.trim() !== "");
			if (validShares.length < sharesThreshold) {
				setDecryptOutput(`Error: Need at least ${sharesThreshold} shares to decrypt`);
				return;
			}

			const keyBytes = await combine(validShares.slice(0, sharesThreshold).map(bs58.decode));
			const key = await crypto.subtle.importKey(
				"raw",
				new Uint8Array(keyBytes),
				{ name: "AES-GCM" },
				true,
				["encrypt", "decrypt"],
			);
			const encryptedInput = new Uint8Array(bs58.decode(decryptInputRef.current?.value || ""));
			const iv = encryptedInput.slice(0, 12); // First 12 bytes are IV
			const ciphertext = encryptedInput.slice(12);
			const decrypted = await crypto.subtle.decrypt(
				{ name: "AES-GCM", iv },
				key,
				ciphertext,
			);
			setDecryptOutput(new TextDecoder().decode(decrypted));
		} catch (error) {
			setDecryptOutput(String(error));
		}
	};

	const copyShareFromAvailable = (shareIndex: number, targetIndex: number) => {
		const newShares = [...selectedShares];
		newShares[targetIndex] = availableShares[shareIndex] || "";
		setSelectedShares(newShares);
	};

	return (
		<div className="operation-panel">
			<h2>Decrypt a Secret</h2>
			<div className="shares-section">
				<h3>Enter Shares:</h3>
				{selectedShares.map((share, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: OK for controlled inputs
					<div key={index} className="share-item">
						<label htmlFor={`decrypt-share-${index}`}>
							{`Share #${index + 1}:`}
						</label>
						<textarea
							id={`decrypt-share-${index}`}
							className="share-input"
							value={share}
							onChange={(e) => handleShareChange(index, e.target.value)}
							placeholder="Paste share here..."
						/>
						{availableShares[index] && (
							<button
								type="button"
								className="copy-button"
								onClick={() => copyShareFromAvailable(index, index)}
							>
								USE GENERATED
							</button>
						)}
					</div>
				))}
			</div>
			<textarea
				ref={decryptInputRef}
				placeholder="Insert the encrypted secret to decrypt"
				className="secret-input"
			/>
			<button type="button" className="action-button" onClick={doDecrypt}>
				DECRYPT
			</button>
			<textarea
				readOnly
				placeholder="The decrypted secret will appear here"
				className="encrypted-output"
				value={decryptOutput}
			/>
		</div>
	);
}