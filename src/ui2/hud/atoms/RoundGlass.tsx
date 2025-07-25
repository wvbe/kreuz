import { PropsWithChildren, default as React, type FunctionComponent } from 'react';
import './RoundGlass.css';

/**
 * A component that creates a round glass-like visual effect overlay for its children.
 * The effect includes a frosted glass appearance with a subtle reflection.
 *
 * @param children - The content to be displayed inside the glass effect
 * @param size - The size of the glass effect (default: `1em`)
 * @param background - The background gradient or color for the glass effect
 *                   (default: `linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)`)
 */
export const RoundGlass: FunctionComponent<
	PropsWithChildren<{
		background?: string;
		size?: string;
	}>
> = ({
	children,
	size = '1em',
	background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
}) => {
	return (
		<div className='round-glass-container' style={{ fontSize: size }}>
			<div className='round-glass-face'></div>
			<div className='round-glass-reflection'></div>
			<div className='round-glass-content' style={{ background }}>
				{children}
			</div>
		</div>
	);
};
