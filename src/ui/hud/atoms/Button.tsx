import React, { FC, PropsWithChildren } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends PropsWithChildren {
	onClick?: () => void;
	disabled?: boolean;
	active?: boolean;
	layout?: 'default' | 'tile' | 'small';
	icon?: string | React.ReactNode;
	iconSide?: 'before' | 'after';
}

export const Button: FC<ButtonProps> = ({
	children,
	onClick,
	disabled = false,
	active = false,
	layout = 'default',
	icon,
	iconSide = 'before',
}) => {
	const iconElement = icon ? <span className={styles['button__icon']}>{icon}</span> : null;

	const content = icon ? (
		iconSide === 'after' ? (
			<>
				{children}
				{iconElement}
			</>
		) : (
			<>
				{iconElement}
				{children}
			</>
		)
	) : (
		children
	);

	return (
		<button
			className={`${styles.button} ${styles[`button--${layout}`]} ${
				active ? styles['button--active'] : ''
			}`}
			onClick={onClick}
			disabled={disabled}
		>
			{content}
		</button>
	);
};
