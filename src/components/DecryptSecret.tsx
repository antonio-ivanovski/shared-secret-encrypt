import { useRef, useState } from "react";
import { doDecrypt } from "../utils/decrypt";
import type { Result } from "../types/Results";

interface DecryptSecretProps {
	sharesThreshold: number;
}

export function DecryptSecret({ sharesThreshold }: DecryptSecretProps) {
	const decryptInputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [decryptResult, setDecryptResult] = useState<Result<string> | null>(
		null,
	);
	const [shares, setShares] = useState<string[]>(
		new Array(sharesThreshold).fill(""),
	);
	const [inputMode, setInputMode] = useState<"text" | "file">("text");
	const [selectedFileName, setSelectedFileName] = useState<string>("");
	const [showContent, setShowContent] = useState<boolean>(false);

	const handleShareChange = (index: number, value: string) => {
		const newShares = [...shares];
		newShares[index] = value;
		setShares(newShares);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (file.size > maxSize) {
			alert("File size must be less than 10MB. Please select a smaller file.");
			return;
		}

		if (file.name.endsWith(".txt.encrypted") || file.type === "text/plain") {
			setSelectedFileName(file.name);
		} else {
			alert("Please select a .txt.encrypted file");
		}
	};

	const handleDecrypt = async () => {
		let encryptedData = "";
		if (inputMode === "file") {
			const file = fileInputRef.current?.files?.[0];
			if (!file) {
				alert("Please select a file to decrypt");
				return;
			}

			// Read file content on-demand
			const content = await file.text();
			encryptedData = content;
		} else {
			encryptedData = decryptInputRef.current?.value || "";
		}

		if (!encryptedData.trim()) {
			alert("Please enter encrypted data or select a file to decrypt");
			return;
		}
		const result = await doDecrypt({
			encryptedData,
			shares: shares,
			sharesThreshold,
		});
		setDecryptResult(result);
	};

	const handleDownloadDecrypted = () => {
		if (!decryptResult?.success) {
			alert("Nothing to download. Please decrypt a secret first.");
			return;
		}

		const blob = new Blob([decryptResult.data], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = selectedFileName
			? selectedFileName.replace(/\.txt\.encrypted$/, ".txt")
			: "decrypted-secret.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleReset = () => {
		setDecryptResult(null);
		setShowContent(false);
		setSelectedFileName("");
		setShares(new Array(sharesThreshold).fill(""));
		if (decryptInputRef.current) {
			decryptInputRef.current.value = "";
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="operation-panel">
			<h2>Decrypt a Secret</h2>

			{!decryptResult && (
				<>
					<div className="shares-section">
						<h3>Enter Shares:</h3>
						{shares.map((share, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: OK for controlled inputs
							<div key={index} className="share-item">
								<label htmlFor={`decrypt-share-${index}`}>
									{`Share #${index + 1}:`}
								</label>
								<input
									id={`decrypt-share-${index}`}
									className="share-input"
									value={share}
									onChange={(e) => handleShareChange(index, e.target.value)}
									placeholder="Paste share here..."
								/>
							</div>
						))}
					</div>

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
								accept=".txt.encrypted"
								onChange={handleFileSelect}
								className="file-input"
								id="decrypt-file-input"
							/>
							<label htmlFor="decrypt-file-input" className="file-input-label">
								Choose .txt.encrypted file to decrypt
							</label>
							<span className="file-size-note">Max file size: 10MB</span>
							{selectedFileName && (
								<span className="selected-file-name">
									✓ Selected: {selectedFileName}
								</span>
							)}
						</div>
					)}

					{inputMode === "text" && (
						<textarea
							ref={decryptInputRef}
							placeholder="Insert the encrypted secret to decrypt"
							className="secret-input"
						/>
					)}
					<button
						type="button"
						className="action-button"
						onClick={handleDecrypt}
					>
						DECRYPT
					</button>
				</>
			)}

			{decryptResult && (
				<>
					<div className="stage-header">
						<button type="button" className="back-button" onClick={handleReset}>
							← Back to Input
						</button>
						<div className="stage-info">
							{inputMode === "file" && selectedFileName && (
								<span className="source-info">
									Decrypted: {selectedFileName}
								</span>
							)}
						</div>
					</div>

					{decryptResult.success ? (
						<div className="decrypt-success">
							<div className="success-message">
								✓ Secret successfully decrypted!
							</div>
							<div className="action-buttons">
								<button
									type="button"
									className="view-button"
									onClick={() => setShowContent(!showContent)}
								>
									{showContent ? "Hide Content" : "View Content"}
								</button>
								<button
									type="button"
									className="download-button"
									onClick={handleDownloadDecrypted}
								>
									Download File
								</button>
							</div>
							{showContent && (
								<div className="decrypted-content">
									<textarea
										readOnly
										value={decryptResult.data}
										className="content-display"
										rows={10}
									/>
								</div>
							)}
						</div>
					) : (
						<div className="error-section">
							<textarea
								readOnly
								placeholder="Error messages will appear here"
								className="encrypted-output error-output"
								value={decryptResult.error.message}
							/>
						</div>
					)}
				</>
			)}
		</div>
	);
}
