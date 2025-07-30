import React, { FunctionComponent, ReactNode } from 'react';
import './EntityBadge.css';
import { RoundGlass } from './atoms/RoundGlass';

export const EntityBadge: FunctionComponent<{
	icon?: string | ReactNode;
	title: ReactNode;
	subtitle: ReactNode;
	/**
	 * If true, the icon space (value or placeholder) will not be rendered.
	 */
	hideIcon?: boolean;
}> = ({ icon, title, subtitle, hideIcon }) => {
	return (
		<div className='entity-badge'>
			{!hideIcon && (
				<div className='entity-badge__icon'>
					<RoundGlass>{icon}</RoundGlass>
				</div>
			)}
			<div className='entity-badge__labels'>
				<p>
					<strong>{title}</strong>
				</p>
				<p>{subtitle}</p>
			</div>
		</div>
	);
};
