import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';

export const MapLocation: React.FC<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		x: number;
		y: number;
		dx?: number;
		dy?: number;
		style?: CSSProperties;
	}
> = ({ x, y, dx = 0, dy = 0, style = {}, ...rest }) => {
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
			...style,
		}),
		[x, y, dx, dy, style],
	);
	return <div style={styleProp} {...rest} />;
};
