interface Tab {
	id: string;
	label: string;
	icon?: string;
}

interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
	return (
		<div className="tab-navigation">
			<div className="tab-controls">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
						onClick={() => onTabChange(tab.id)}
						type="button"
					>
						{tab.icon && <span className="tab-icon">{tab.icon}</span>}
						<span className="tab-label">{tab.label}</span>
					</button>
				))}
			</div>
		</div>
	);
}