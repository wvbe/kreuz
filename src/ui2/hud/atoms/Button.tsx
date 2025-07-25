import React, { FC, PropsWithChildren } from 'react';
import './Button.css';

export interface ButtonProps extends PropsWithChildren {
	onClick?: () => void;
	disabled?: boolean;
	active?: boolean;
	layout?: 'default' | 'tile';
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
	const iconElement = icon ? <span className='button__icon'>{icon}</span> : null;

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
			className={`button button--${layout} ${active ? 'button--active' : ''}`}
			onClick={onClick}
			disabled={disabled}
		>
			{content}
		</button>
	);
};
