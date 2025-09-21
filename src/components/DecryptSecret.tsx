import { useRef, useState } from "react";
import { doDecrypt } from "../utils/decrypt";

interface DecryptSecretProps {
	sharesThreshold: number;
}

export function DecryptSecret({ sharesThreshold }: DecryptSecretProps) {
	const decryptInputRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [decryptOutput, setDecryptOutput] = useState<string>("");
	const [selectedShares, setSelectedShares] = useState<string[]>(
		new Array(sharesThreshold).fill("")
	);
	const [inputMode, setInputMode] = useState<"text" | "file">("text");
	const [selectedFileName, setSelectedFileName] = useState<string>("");
	const [isDecrypted, setIsDecrypted] = useState<boolean>(false);

	const handleShareChange = (index: number, value: string) => {
		const newShares = [...selectedShares];
		newShares[index] = value;
		setSelectedShares(newShares);
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
		try {
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
				shares: selectedShares,
				sharesThreshold,
			});
			setDecryptOutput(result);
			setIsDecrypted(!result.includes("Error"));
		} catch (error) {
			setDecryptOutput(String(error));
			setIsDecrypted(false);
		}
	};

	const handleDownloadDecrypted = () => {
		if (!decryptOutput) {
			alert("Nothing to download. Please decrypt a secret first.");
			return;
		}
		
		const blob = new Blob([decryptOutput], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = selectedFileName ? 
			selectedFileName.replace(/\.txt\.encrypted$/, ".txt") : 
			"decrypted-secret.txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleReset = () => {
		setDecryptOutput("");
		setIsDecrypted(false);
		setSelectedFileName("");
		setSelectedShares(new Array(sharesThreshold).fill(""));
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
			
			{!decryptOutput && (
				<>
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
								<span className="selected-file-name">✓ Selected: {selectedFileName}</span>
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
					<button type="button" className="action-button" onClick={handleDecrypt}>
						DECRYPT
					</button>
				</>
			)}

			{decryptOutput && (
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
								<span className="source-info">Decrypted: {selectedFileName}</span>
							)}
						</div>
					</div>

					{isDecrypted ? (
						<div className="decrypt-success">
							<div className="success-message">
								✓ Secret successfully decrypted!
							</div>
							<button 
								type="button" 
								className="download-button" 
								onClick={handleDownloadDecrypted}
							>
								Download Decrypted File
							</button>
						</div>
					) : decryptOutput && (
						<textarea
							readOnly
							placeholder="Error messages will appear here"
							className="encrypted-output error-output"
							value={decryptOutput}
						/>
					)}
				</>
			)}
		</div>
	);
}