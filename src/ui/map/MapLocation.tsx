import React, { CSSProperties, DetailedHTMLProps, HTMLAttributes, useMemo } from 'react';
import { EventedValue } from '../../game/core/events/EventedValue';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useEventedValue } from '../hooks/useEventedValue';

/**
 * Puts a div at a given location on the map.
 */
export const MapLocation: React.FC<
	DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
		qualifiedCoordinates?: QualifiedCoordinate;
		eventedQualifiedCoordinates?: EventedValue<QualifiedCoordinate>;
		dx?: number;
		dy?: number;
		style?: CSSProperties;
		zIndex?: number;
	}
> = ({
	qualifiedCoordinates,
	eventedQualifiedCoordinates,
	dx = 0,
	dy = 0,
	style = {},
	zIndex = 0,
	...rest
}) => {
	const [_terrain, x, y] =
		qualifiedCoordinates ?? useEventedValue(eventedQualifiedCoordinates!) ?? [];
	const styleProp = useMemo<CSSProperties>(
		() => ({
			position: 'absolute',
			width: `${dx}em`,
			height: `${dy}em`,
			left: `${x}em`,
			top: `${y}em`,
			transform: `translate(-50%, -50%)`,
			// transform: `translate(-0.5em, -0.5em)`,
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
