import React, {
	FunctionComponent,
	HtmlHTMLAttributes,
	ReactElement,
	useCallback,
	useState,
} from 'react';

export const CollapsibleWindow: FunctionComponent<
	{
		label: ReactElement | string;
		initiallyOpened?: boolean;
	} & HtmlHTMLAttributes<HTMLElement>
> = ({ label, children, initiallyOpened, ...rest }) => {
	const [isCollapsed, setIsCollapsed] = useState(!initiallyOpened);

	const toggleCollapse = useCallback(() => {
		setIsCollapsed((isCollapsed) => !isCollapsed);
	}, [isCollapsed]);

	return (
		<aside className="collapsible-window" {...rest}>
			<header onClick={toggleCollapse}>{label}</header>
			{!isCollapsed && <div>{children}</div>}
		</aside>
	);
};
