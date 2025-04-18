import React, { type FunctionComponent, type ReactNode } from 'react';
import { PopOnUpdateSpan } from './PopOnUpdateSpan';

import './badge.css';

export const Badge: FunctionComponent<{
	icon: string | ReactNode;
	title: ReactNode;
	subtitle: ReactNode;
}> = ({ icon, title, subtitle }) => {
	return (
		<header className='badge'>
			<div className='meta--emoji-symbols badge__icon'>
				<div className='badge__icon__inner'>{icon}</div>
			</div>
			<div className='badge__labels'>
				<h1>{title}</h1>
				<p>
					<PopOnUpdateSpan>{subtitle}</PopOnUpdateSpan>
				</p>
			</div>
		</header>
	);
};
