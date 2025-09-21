import { Config, EncryptSecret, DecryptSecret, Tabs } from "./components";
import { useState } from "react";

const tabs = [
	{ id: "encrypt", label: "Encrypt Secret", icon: "🔒" },
	{ id: "decrypt", label: "Decrypt Secret", icon: "🔓" },
];

type CryptoFlowConfig = {
	sharesCount: number;
	sharesThreshold: number;
};

export function CryptoFlow() {
	const [config, setConfig] = useState<CryptoFlowConfig>({
		sharesCount: 3,
		sharesThreshold: 2,
	});
	const [activeTab, setActiveTab] = useState<string>("encrypt");

	const handleConfigChange = (newConfig: CryptoFlowConfig) => {
		setConfig(newConfig);
	};

	return (
		<div className="secret-sharing-app">
			<Config
				sharesCount={config.sharesCount}
				sharesThreshold={config.sharesThreshold}
				onConfigChange={handleConfigChange}
			/>

			<div className="intro-section">
				<h2>🔐 Secure Secret Sharing</h2>
				<p>
					Securely split your secrets into multiple shares using cryptographic threshold schemes. 
					Your secret is encrypted and divided into {config.sharesCount} shares, where any {config.sharesThreshold} shares 
					can reconstruct the original secret.
				</p>
				
				<div className="quick-guide">
					<div className="guide-step">
						<strong>Encrypt:</strong> Split your secret into secure shares for distribution
					</div>
					<div className="guide-step">
						<strong>Decrypt:</strong> Combine shares to reconstruct your original secret
					</div>
					<div className="guide-step">
						<strong>Share URLs:</strong> Send password-protected shares via secure channels
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
					{activeTab === "encrypt" && (
						<EncryptSecret
							sharesCount={config.sharesCount}
							sharesThreshold={config.sharesThreshold}
						/>
					)}

					{activeTab === "decrypt" && (
						<DecryptSecret
							sharesThreshold={config.sharesThreshold}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
