import { EncryptSecret, DecryptSecret, Tabs } from "./components";
import { useState } from "react";

import logo from "./logo.svg";

const tabs = [
	{ id: "encrypt", label: "Encrypt Secret", icon: "🔒" },
	{ id: "decrypt", label: "Decrypt Secret", icon: "🔓" },
];

export function CryptoFlow() {
	const [sharesThreshold] = useState<number>(2);
	const [activeTab, setActiveTab] = useState<string>("encrypt");

	return (
		<div className="secret-sharing-app">
			<div className="intro-section">
				<h2>
					<img src={logo} alt="Logo" />
				</h2>
				<p>
					Securely split your secrets into multiple shares using cryptographic
					threshold schemes. Use Shamir's Secret Sharing to encrypt and divide
					your secret into shares, where a minimum threshold of shares can
					reconstruct the original secret.
				</p>

				<div className="quick-guide">
					<div className="guide-step">
						<strong>Encrypt:</strong> Split your secret into secure shares for
						distribution
					</div>
					<div className="guide-step">
						<strong>Decrypt:</strong> Combine shares to reconstruct your
						original secret
					</div>
					<div className="guide-step">
						<strong>Share URLs:</strong> Send password-protected shares via
						secure channels
					</div>
				</div>

				<div className="github-link">
					<a
						href="https://github.com/antonio-ivanovski/shared-secret-encrypt"
						target="_blank"
						rel="noopener noreferrer"
						className="readme-link"
					>
						📖 View Documentation & Source Code on GitHub
					</a>
				</div>
			</div>

			<div className="operation-tabs">
				<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

				<div className="operation-content">
					{activeTab === "encrypt" && <EncryptSecret />}

					{activeTab === "decrypt" && <DecryptSecret />}
				</div>
			</div>
		</div>
	);
}
