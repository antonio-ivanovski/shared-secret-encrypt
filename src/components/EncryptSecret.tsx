import { useRef, useState } from "react";
import { doEncrypt } from "../utils/encrypt";

interface EncryptSecretProps {
	sharesCount: number;
	sharesThreshold: number;
}

export function EncryptSecret({ sharesCount, sharesThreshold }: EncryptSecretProps) {
	const encryptInputRef = useRef<HTMLTextAreaElement>(null);
	const [encryptOutput, setEncryptOutput] = useState<string>("");
	const [shares, setShares] = useState<string[]>([]);

	const handleEncrypt = async () => {
		try {
			const secret = encryptInputRef.current?.value || "";
			const result = await doEncrypt({
				secret,
				sharesCount,
				sharesThreshold,
			});
			
			setEncryptOutput(result.encryptedData);
			setShares(result.shares);
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
			<button type="button" className="action-button" onClick={handleEncrypt}>
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