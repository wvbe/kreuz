import { FunctionComponent } from 'react';
import { PopOnUpdateSpan } from './PopOnUpdateSpan.tsx';

export const FillBar: FunctionComponent<{ ratio: number; label?: string; labelRight?: string }> = ({
	ratio,
	label,
	labelRight,
}) => {
	const safeRatio = Math.max(0, Math.min(1, ratio));
	return (
		<div className="fillbar">
			{(label || labelRight) && (
				<div className="fillbar__labels">
					{label && <PopOnUpdateSpan text={label} className="fillbar__label" />}
					{labelRight && <PopOnUpdateSpan text={labelRight} className="fillbar__label-right" />}
				</div>
			)}
			<div className="fillbar__track">
				<div className="fillbar__fill" style={{ width: `${safeRatio * 100}%` }}></div>
			</div>
		</div>
	);
};
