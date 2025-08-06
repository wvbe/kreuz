import { FC, PropsWithChildren } from 'react';

import React from 'react';
import styles from './Panel.module.css';

export const Panel: FC<
	PropsWithChildren<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>
> = ({ children, ...props }) => {
	return (
		<div {...props} className={`${styles.panel} ${props.className ?? ''}`}>
			{children}
		</div>
	);
};
