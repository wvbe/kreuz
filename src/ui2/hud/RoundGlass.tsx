import { PropsWithChildren, default as React, type FunctionComponent } from 'react';
import './RoundGlass.css';

export const RoundGlass: FunctionComponent<PropsWithChildren<{ background?: string }>> = ({
	children,
	background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
}) => {
	return (
		<div className='round-glass-container'>
			<div className='round-glass-face'></div>
			<div className='round-glass-reflection'></div>
			<div className='round-glass-content' style={{ background }}>
				{children}
			</div>
		</div>
	);
};
