import { useRef, useState } from "react";
import { doDecrypt } from "../utils/decrypt";

interface DecryptSecretProps {
	sharesThreshold: number;
}

export function DecryptSecret({ sharesThreshold }: DecryptSecretProps) {
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

	const handleDecrypt = async () => {
		try {
			const encryptedData = decryptInputRef.current?.value || "";
			const result = await doDecrypt({
				encryptedData,
				shares: selectedShares,
				sharesThreshold,
			});
			setDecryptOutput(result);
		} catch (error) {
			setDecryptOutput(String(error));
		}
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
					</div>
				))}
			</div>
			<textarea
				ref={decryptInputRef}
				placeholder="Insert the encrypted secret to decrypt"
				className="secret-input"
			/>
			<button type="button" className="action-button" onClick={handleDecrypt}>
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