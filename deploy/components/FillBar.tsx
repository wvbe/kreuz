import { FunctionComponent } from 'react';

export const FillBar: FunctionComponent<{ ratio: number; label?: string; labelRight?: string }> = ({
	ratio,
	label,
	labelRight,
}) => {
	const safeRatio = Math.max(0, Math.min(1, ratio));
	return (
		<div className="fillbar">
			{label ||
				(labelRight && (
					<div className="fillbar__labels">
						{label && <div className="fillbar__label">Left</div>}
						{labelRight && <div className="fillbar__label-right">Right</div>}
					</div>
				))}
			<div className="fillbar__track">
				<div className="fillbar__fill" style={{ width: `${safeRatio * 100}%` }}></div>
			</div>
		</div>
	);
};
