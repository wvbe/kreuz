import React, { FC, PropsWithChildren, useMemo } from 'react';

export const MapTileContextMenuItem: FC<PropsWithChildren & { onClick?: () => void }> = ({
	children,
	onClick,
}) => {
	const className = useMemo(
		() =>
			['map-tile-context-menu_item', onClick && 'map-tile-context-menu_item--interactive']
				.filter(Boolean)
				.join(' '),
		[onClick],
	);

	return (
		<div className={className} onClick={onClick}>
			{children}
		</div>
	);
};
