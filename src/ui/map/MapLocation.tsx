import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

/**
 * Puts a div at a given location on the map.
 */
export const MapLocation: React.FC<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		x: number;
		y: number;
		dx?: number;
		dy?: number;
		style?: CSSProperties;
		zIndex?: number;
	}
> = ({ x, y, dx = 0, dy = 0, style = {}, zIndex = 0, ...rest }) => {
	const styleProp = useMemo<CSSProperties>(
		() => ({
			position: 'absolute',
			width: `${dx}em`,
			height: `${dy}em`,
			left: `${x}em`,
			top: `${y}em`,
			transform: `translate(-50%, -50%)`,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			zIndex,
			...style,
		}),
		[x, y, dx, dy, style, zIndex],
	);
	return <div style={styleProp} {...rest} />;
};
