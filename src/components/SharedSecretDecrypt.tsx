import { useState, useEffect, useMemo } from "react";
import { decryptShareFromUrl, type ShareUrlData } from "../utils/urlSharing";
import type { Result } from "../types/Results";
import { navigate } from "wouter/use-browser-location";
import { useSearchParams } from "wouter";

export function SharedSecretDecrypt() {
	const [password, setPassword] = useState<string>("");
	const [decryptedShare, setDecryptedShare] = useState<Result<string>>();
	const [showDecryptedShare, setShowDecryptedShare] = useState<boolean>(false);
	const [searchParams] = useSearchParams();

	const navigateToMain = () => navigate("/", { replace: true });

	const shareUrlData: Result<ShareUrlData> = useMemo(() => {
		const encryptedShare = searchParams.get("s");
		const iv = searchParams.get("iv");
		const salt = searchParams.get("salt");

		if (encryptedShare && iv && salt) {
			return {
				success: true,
				data: {
					encryptedShare,
					iv,
					salt,
				},
			};
		}
		return {
			success: false,
			error: new Error("Missing required URL parameters"),
		};
	}, [searchParams]);

	const handleDecrypt = async () => {
		if (!password.trim()) {
			setDecryptedShare({
				success: false,
				error: new Error("Please enter the password"),
			});
			return;
		}

		if (!shareUrlData.success) {
			setDecryptedShare({
				success: false,
				error: new Error("No URL data available"),
			});
			return;
		}

		const result = await decryptShareFromUrl({
			urlData: shareUrlData.data,
			password,
		});
		setDecryptedShare(result);
	};

	const handleCopyShare = () => {
		navigator.clipboard.writeText(
			decryptedShare?.success ? decryptedShare.data : "",
		);
	};

	return (
		<div className="app">
			<div className="shared-secret-decrypt">
				<div className="operation-panel">
					<div className="stage-header">
						<button
							type="button"
							className="back-button"
							onClick={navigateToMain}
						>
							← Back to Main
						</button>
						<div className="stage-info">
							<h2>Decrypt Shared Secret</h2>
						</div>
					</div>

					{shareUrlData?.success === false ? (
						<div className="error-section">
							<div className="error-message">{shareUrlData.error.message}</div>
							<p className="error-description">
								This URL doesn't contain valid shared secret data. Please check
								the URL and try again.
							</p>
						</div>
					) : decryptedShare?.success === true ? (
						<div className="decrypt-result-section">
							<div className="success-message">
								✅ Share decrypted successfully!
							</div>

							<div className="decrypted-share-section">
								<div className="share-header">
									<label htmlFor="decrypted-share" className="share-label">
										Decrypted Share:
									</label>
									<div className="share-actions">
										<button
											type="button"
											className="reveal-button"
											onClick={() => setShowDecryptedShare(!showDecryptedShare)}
										>
											{showDecryptedShare ? "👁️ Hide" : "👁️ Show"}
										</button>
										<button
											type="button"
											className="copy-button"
											onClick={handleCopyShare}
										>
											Copy Share
										</button>
									</div>
								</div>
								<input
									id="decrypted-share"
									readOnly
									type={showDecryptedShare ? "text" : "password"}
									className="share-input"
									value={decryptedShare.data}
								/>
							</div>

							<div className="instructions-section">
								<h3>🔐 What is this share?</h3>
								<p>
									You've successfully decrypted one piece of a secret that was split using Shamir's Secret Sharing scheme. 
									This share alone cannot reveal the original secret - it's designed to be secure even if intercepted.
								</p>
								
								<h3>💾 Next Steps:</h3>
								<div className="instruction-steps">
									<div className="step">
										<strong>1. Save Securely:</strong> Copy and store this share in a secure location (password manager, encrypted file, etc.)
									</div>
									<div className="step">
										<strong>2. Coordinate with Others:</strong> The original secret was split into multiple shares. You'll need to gather the required number of shares from other participants.
									</div>
									<div className="step">
										<strong>3. Reconstruct the Secret:</strong> When ready, use the "Decrypt Secret" feature in the main application to combine all shares and reveal the original secret.
									</div>
								</div>
								
								<div className="security-note">
									<strong>🛡️ Security Reminder:</strong> Keep this share private and secure. Never share it through unsecured channels.
								</div>
							</div>
						</div>
					) : (
						<div className="decrypt-input-section">
							<div className="decrypt-description">
								<p>
									This URL contains an encrypted share that requires a password
									to decrypt.
								</p>
								<p>
									Enter the password that was used when creating this shareable
									URL:
								</p>
							</div>

							<div className="password-input-section">
								<label htmlFor="decrypt-password" className="password-label">
									Password:
								</label>
								<div className="password-input-group">
									<input
										id="decrypt-password"
										type="password"
										placeholder="Enter the password for this shared secret"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="share-password-input"
										onKeyDown={(e) => {
											if (e.key === "Enter" && password.trim()) {
												handleDecrypt();
											}
										}}
									/>
									<button
										type="button"
										className="action-button"
										onClick={handleDecrypt}
										disabled={!password.trim()}
									>
										Decrypt
									</button>
								</div>
							</div>

							{decryptedShare?.success === false && (
								<div className="error-section">
									<div className="error-message">
										{String(decryptedShare.error)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
