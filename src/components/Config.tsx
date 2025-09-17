interface ConfigProps {
	sharesCount: number;
	sharesThreshold: number;
	onConfigChange: (config: { sharesCount: number; sharesThreshold: number }) => void;
}

export function Config({ sharesCount, sharesThreshold, onConfigChange }: ConfigProps) {
	return (
		<div className="shares-config">
			<label>
				Shares Count:
				<input
					type="number"
					value={sharesCount}
					onChange={(e) =>
						onConfigChange({
							sharesCount: Math.max(2, Math.min(10, Number(e.target.value))),
							sharesThreshold,
						})
					}
					min={2}
					max={10}
				/>
			</label>
			<label>
				Shares Threshold:
				<input
					type="number"
					value={sharesThreshold}
					onChange={(e) =>
						onConfigChange({
							sharesCount,
							sharesThreshold: Math.max(
								2,
								Math.min(sharesCount, Number(e.target.value)),
							),
						})
					}
					min={2}
					max={sharesCount}
				/>
			</label>
		</div>
	);
}