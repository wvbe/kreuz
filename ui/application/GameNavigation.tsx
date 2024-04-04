import React, { FC, PropsWithChildren, useCallback } from 'react';
import { useNavigation } from '../hooks/useNavigation.ts';

export const GameNavigationButton: FC<{
	symbol: string;
	path: string;
	params?: Record<string, string>;
	tooltip?: string;
}> = ({ symbol, path, params, tooltip }) => {
	const navigate = useNavigation();
	const onClick = useCallback<React.MouseEventHandler<HTMLAnchorElement>>(
		(event) => {
			event.preventDefault();
			event.stopPropagation();
			navigate(path, params);
		},
		[path, params],
	);
	return (
		<a onClick={onClick} className="panel game-navigation-button" title={tooltip}>
			{symbol}
		</a>
	);
};
export const GameNavigation: FC<PropsWithChildren> = ({ children }) => {
	return <nav>{children}</nav>;
};
