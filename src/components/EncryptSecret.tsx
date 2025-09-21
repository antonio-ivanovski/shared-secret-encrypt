import { useRef, useState } from "react";
import { doEncrypt } from "../utils/encrypt";

interface EncryptSecretProps {
	sharesCount: number;
	sharesThreshold: number;
}

export function EncryptSecret({ sharesCount, sharesThreshold }: EncryptSecretProps) {
	const encryptInputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [encryptResult, setEncryptResult] = useState<{
		encryptedData: string;
		shares: string[];
	} | null>(null);
	const [inputMode, setInputMode] = useState<"text" | "file">("text");
	const [selectedFileName, setSelectedFileName] = useState<string>("");

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		
		// Check file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (file.size > maxSize) {
			alert("File size must be less than 10MB. Please select a smaller file.");
			return;
		}
		
		if (file.type === "text/plain") {
			setSelectedFileName(file.name);
		} else {
			alert("Please select a .txt file");
		}
	};

	const handleEncrypt = async () => {
		try {
			let secret = "";
			if (inputMode === "file") {
				const file = fileInputRef.current?.files?.[0];
				if (!file) {
					alert("Please select a file to encrypt");
					return;
				}
				
				// Read file content on-demand
				const content = await file.text();
				secret = content;
			} else {
				secret = encryptInputRef.current?.value || "";
			}
			
			if (!secret.trim()) {
				alert("Please enter a secret or select a file to encrypt");
				return;
			}
			const result = await doEncrypt({
				secret,
				sharesCount,
				sharesThreshold,
			});
			
			setEncryptResult({
				encryptedData: result.encryptedData,
				shares: result.shares
			});
		} catch (error) {
			setEncryptResult({
				encryptedData: String(error),
				shares: []
			});
		}
	};

	const handleDownloadEncrypted = () => {
		if (!encryptResult?.encryptedData) {
			alert("Nothing to download. Please encrypt a secret first.");
			return;
		}
		
		const blob = new Blob([encryptResult.encryptedData], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = selectedFileName ? 
			selectedFileName.replace(/\.txt$/, ".txt.encrypted") : 
			"encrypted-secret.txt.encrypted";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleReset = () => {
		setEncryptResult(null);
		setSelectedFileName("");
		if (encryptInputRef.current) {
			encryptInputRef.current.value = "";
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="operation-panel">
			<h2>Encrypt a Secret</h2>
			
			{!encryptResult && (
				<>
					<div className="input-mode-toggle">
						<button
							type="button"
							className={`toggle-button ${inputMode === "text" ? "active" : ""}`}
							onClick={() => setInputMode("text")}
						>
							Text Input
						</button>
						<button
							type="button"
							className={`toggle-button ${inputMode === "file" ? "active" : ""}`}
							onClick={() => setInputMode("file")}
						>
							File Upload
						</button>
					</div>

					{inputMode === "file" && (
						<div className="file-input-section">
							<input
								ref={fileInputRef}
								type="file"
								accept=".txt"
								onChange={handleFileSelect}
								className="file-input"
								id="encrypt-file-input"
							/>
							<label htmlFor="encrypt-file-input" className="file-input-label">
								Choose .txt file to encrypt
							</label>
							<span className="file-size-note">Max file size: 10MB</span>
							{selectedFileName && (
								<span className="selected-file-name">✓ Selected: {selectedFileName}</span>
							)}
						</div>
					)}

					{inputMode === "text" && (
						<textarea
							ref={encryptInputRef}
							placeholder="Insert your secret to encrypt"
							className="secret-input"
						/>
					)}
					<button type="button" className="action-button" onClick={handleEncrypt}>
						ENCRYPT
					</button>
				</>
			)}

			{encryptResult && (
				<>
					<div className="stage-header">
						<button 
							type="button" 
							className="back-button" 
							onClick={handleReset}
						>
							← Back to Input
						</button>
						<div className="stage-info">
							{inputMode === "file" && selectedFileName && (
								<span className="source-info">Encrypted: {selectedFileName}</span>
							)}
						</div>
					</div>

					<textarea
						readOnly
						placeholder="The encrypted secret will appear here"
						className="encrypted-output"
						value={encryptResult.encryptedData}
					/>
					{encryptResult.encryptedData && (
						<button 
							type="button" 
							className="download-button" 
							onClick={handleDownloadEncrypted}
						>
							Download as .txt.encrypted
						</button>
					)}

					<div className="shares-section">
						<h3>Shares:</h3>
						{Array.from({ length: sharesCount }, (_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: OK for static placeholder areas
							<div key={index} className="share-item">
								<textarea
									style={{ flex: 1 }}
									readOnly
									className="share-input"
									value={encryptResult.shares[index] || ""}
									placeholder={`Share #${index + 1} will appear here after encryption`}
								/>
								{encryptResult.shares[index] && (
									<button
										type="button"
										className="copy-button"
										onClick={() => {
											navigator.clipboard.writeText(encryptResult.shares[index]);
										}}
									>
										{`COPY #${index + 1}`}
									</button>
								)}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}