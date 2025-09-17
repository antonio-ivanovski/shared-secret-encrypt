import { useRef, useState } from "react";
import { split } from "shamir-secret-sharing";
import bs58 from "bs58";

interface EncryptSecretProps {
	sharesCount: number;
	sharesThreshold: number;
	onSharesGenerated: (shares: string[]) => void;
}

export function EncryptSecret({ sharesCount, sharesThreshold, onSharesGenerated }: EncryptSecretProps) {
	const encryptInputRef = useRef<HTMLTextAreaElement>(null);
	const [encryptOutput, setEncryptOutput] = useState<string>("");
	const [shares, setShares] = useState<string[]>([]);

	const doEncrypt = async () => {
		try {
			const key = await window.crypto.subtle.generateKey(
				{
					name: "AES-GCM",
					length: 256,
				},
				true,
				["encrypt", "decrypt"],
			);

			const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
			const plaintext = new TextEncoder().encode(encryptInputRef.current?.value || "");
			const encrypted = await window.crypto.subtle.encrypt(
				{ name: "AES-GCM", iv },
				key,
				plaintext,
			);
			// Concatenate IV and ciphertext for transport
			const encryptedBytes = new Uint8Array(iv.length + encrypted.byteLength);
			encryptedBytes.set(iv, 0);
			encryptedBytes.set(new Uint8Array(encrypted), iv.length);
			const encoded = bs58.encode(encryptedBytes);

			const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
			const generatedShares = await split(
				rawKey,
				sharesCount,
				sharesThreshold,
			).then((shares) => shares.map(bs58.encode));

			setEncryptOutput(encoded);
			setShares(generatedShares);
			onSharesGenerated(generatedShares);
		} catch (error) {
			setEncryptOutput(String(error));
		}
	};

	return (
		<div className="operation-panel">
			<h2>Encrypt a Secret</h2>
			<textarea
				ref={encryptInputRef}
				placeholder="Insert your secret to encrypt"
				className="secret-input"
			/>
			<button type="button" className="action-button" onClick={doEncrypt}>
				ENCRYPT
			</button>
			<textarea
				readOnly
				placeholder="The encrypted secret will appear here"
				className="encrypted-output"
				value={encryptOutput}
			/>

			<div className="shares-section">
				<h3>Shares:</h3>
				{Array.from({ length: sharesCount }, (_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: OK for static placeholder areas
					<div key={index} className="share-item">
						<textarea
							style={{ flex: 1 }}
							readOnly
							className="share-input"
							value={shares[index] || ""}
							placeholder={`Share #${index + 1} will appear here after encryption`}
						/>
						{shares[index] && (
							<button
								type="button"
								className="copy-button"
								onClick={() => {
									navigator.clipboard.writeText(shares[index]);
								}}
							>
								{`COPY #${index + 1}`}
							</button>
						)}
					</div>
				))}
			</div>
		</div>
	);
}