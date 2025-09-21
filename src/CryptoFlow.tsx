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
