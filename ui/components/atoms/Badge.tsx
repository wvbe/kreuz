import React, { FunctionComponent } from 'react';
import { PopOnUpdateSpan } from './PopOnUpdateSpan.tsx';

export const Badge: FunctionComponent<{ icon: string; title: string; subtitle: string }> = ({
	icon,
	title,
	subtitle,
}) => {
	return (
		<header className="badge">
			<div className="meta--emoji-symbols badge__icon">{icon}</div>
			<div className="badge__labels">
				<h1>{title}</h1>
				<p>
					<PopOnUpdateSpan text={subtitle} />
				</p>
			</div>
		</header>
	);
};
