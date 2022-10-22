import { FunctionComponent } from 'react';

export const Badge: FunctionComponent<{ icon: string; title: string; subtitle: string }> = ({
	icon,
	title,
	subtitle,
}) => {
	return (
		<header className="badge">
			<div className="badge__icon">{icon}</div>
			<div className="badge__labels">
				<h1>{title}</h1>
				<p>{subtitle}</p>
			</div>
		</header>
	);
};
