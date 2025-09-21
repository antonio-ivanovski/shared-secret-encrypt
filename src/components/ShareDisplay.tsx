import { useState } from "react";
import { createShareUrl } from "../utils/urlSharing";

interface ShareDisplayProps {
	shareIndex: number;
	shareValue: string;
	onCopyShare: (share: string) => void;
}

export function ShareDisplay({ shareIndex, shareValue, onCopyShare }: ShareDisplayProps) {
	const [password, setPassword] = useState<string>("");
	const [shareUrl, setShareUrl] = useState<string>("");
	const [showRawShare, setShowRawShare] = useState<boolean>(false);

	const handleCopyShare = () => {
		onCopyShare(shareValue);
	};

	const handleGenerateUrl = async () => {
		if (!password.trim()) {
			alert("Please enter a password for this share");
			return;
		}

		try {
			const result = await createShareUrl({
				share: shareValue,
				password: password
			});

			if (result.success) {
				setShareUrl(result.data);
			} else {
				alert(`Failed to generate URL: ${result.error.message}`);
			}
		} catch {
            alert("An unexpected error occurred while generating the URL");
        }
	};

	const handleCopyUrl = () => {
		navigator.clipboard.writeText(shareUrl);
	};

	const handleClearUrl = () => {
		setShareUrl("");
		setPassword("");
	};

	return (
		<div className="share-display">
			<div className="share-header">
				<label htmlFor={`share-${shareIndex}`}>
					Raw Share #{shareIndex + 1}:
				</label>
				<div className="share-actions">
					{shareValue && (
						<button
							type="button"
							className="reveal-button"
							onClick={() => setShowRawShare(!showRawShare)}
						>
							{showRawShare ? "👁️ Hide" : "👁️ Show"}
						</button>
					)}
					<button
						type="button"
						className="copy-button"
						onClick={handleCopyShare}
						disabled={!shareValue}
					>
						Copy
					</button>
				</div>
			</div>

            <textarea
                id={`share-${shareIndex}`}
                readOnly
                className="share-input"
                value={showRawShare ? shareValue : shareValue.replace(/./g, '•')}
                placeholder={`Share #${shareIndex + 1} will appear here after encryption`}
            />

			{shareValue && (
				<div className="url-sharing-controls">
					{!shareUrl ? (
						<div className="url-generation">
							<label htmlFor={`password-${shareIndex}`} className="password-label">
								{`Password protected URL sharing of share #${shareIndex + 1}:`}
							</label>
							<div className="password-input-group">
								<input
									id={`password-${shareIndex}`}
									type="password"
									placeholder="Enter password to generate shareable URL (min 6 chars)"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="share-password-input"
								/>
								<button
									type="button"
									className="generate-url-button"
									onClick={handleGenerateUrl}
									disabled={password.trim().length < 6 || !shareValue}
								>
									Generate URL
								</button>
							</div>
						</div>
					) : (
						<div className="url-result-section">
							<div className="url-result-header">
								Generated shareable URL for share #{shareIndex + 1}:
							</div>
							<div className="url-display-section">
								<textarea
									readOnly
									value={shareUrl}
									className="url-display"
									rows={3}
								/>
								<div className="url-actions">
									<button
										type="button"
										className="copy-url-button"
										onClick={handleCopyUrl}
									>
										Copy URL
									</button>
									<button
										type="button"
										className="clear-url-button"
										onClick={handleClearUrl}
									>
										Reset
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}