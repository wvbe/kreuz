import { FunctionComponent, ReactNode } from 'react';
import styles from './EntityBadge.module.css';
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
		<div className={styles['entity-badge']}>
			{!hideIcon && (
				<div className={styles['entity-badge__icon']}>
					<RoundGlass>{icon}</RoundGlass>
				</div>
			)}
			<div className={styles['entity-badge__labels']}>
				<p>
					<strong>{title}</strong>
				</p>
				<p>{subtitle}</p>
			</div>
		</div>
	);
};
