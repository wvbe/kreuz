import React, { FunctionComponent, HtmlHTMLAttributes, ReactElement, useState } from 'react';

export const CollapsibleWindow: FunctionComponent<
	{
		label: ReactElement | string;
		initiallyOpened?: boolean;
	} & HtmlHTMLAttributes<HTMLElement>
> = ({ label, children, initiallyOpened, ...rest }) => {
	const [isCollapsed, setIsCollapsed] = useState(!initiallyOpened);

	return (
		<aside className="collapsible-window" {...rest}>
			<header
				onClick={() => {
					setIsCollapsed((isCollapsed) => !isCollapsed);
				}}
			>
				{label}
			</header>

			{!isCollapsed && <div>{children}</div>}
		</aside>
	);
};
