import React, { FunctionComponent, ReactNode } from 'react';
import './EntityBadge.css';
import { RoundGlass } from './RoundGlass';

export const EntityBadge: FunctionComponent<{
	icon: string | ReactNode;
	title: ReactNode;
	subtitle: ReactNode;
}> = ({ icon, title, subtitle }) => {
	return (
		<div className='entity-badge'>
			<div className='meta--emoji-symbols entity-badge__icon'>
				<RoundGlass>{icon}</RoundGlass>
			</div>
			<div className='entity-badge__labels'>
				<p>
					<strong>{title}</strong>
				</p>
				<p>{subtitle}</p>
			</div>
		</div>
	);
};
