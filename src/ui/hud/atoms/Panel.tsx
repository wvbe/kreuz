import { FC, PropsWithChildren } from 'react';

import React from 'react';
import './Panel.css';

export const Panel: FC<
	PropsWithChildren<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>>
> = ({ children, ...props }) => {
	return (
		<div {...props} className={`panel ${props.className ?? ''}`}>
			{children}
		</div>
	);
};
