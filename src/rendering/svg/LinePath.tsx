import React, { FunctionComponent, ReactElement } from 'react';
import { CoordinateArray } from '../../classes/Coordinate';

import { perspective } from './perspective';

const BORDER_WIDTH = 0;

export const LinePath: FunctionComponent<
	Omit<React.SVGProps<SVGLineElement>, 'path'> & {
		path: CoordinateArray[];
	}
> = ({ path, stroke = 'black', strokeWidth = BORDER_WIDTH }) => {
	let spatialCoordinates = path
		.map(coordinate => perspective.toPixels(...coordinate))
		.map(cc => cc.map(c => c + BORDER_WIDTH));

	return (
		<>
			{spatialCoordinates.reduce<ReactElement[]>(
				(lines, start, i, all) =>
					i
						? lines.concat([
								<line
									key={i}
									x1={start[0]}
									y1={start[1]}
									x2={all[i - 1][0]}
									y2={all[i - 1][1]}
									stroke={stroke}
									strokeWidth={String(strokeWidth)}
								/>
						  ])
						: lines,
				[]
			)}
		</>
	);
};
