import React, { FunctionComponent } from 'react';
import { perspective } from '../constants/perspective';
import { Anchor } from './Anchor';
import { Coordinate } from '../classes/Coordinate';

function arrayOfLength(l: number) {
	const widthArr = [];
	for (let i = 0; i < l; i++) {
		widthArr.push(i);
	}
	return widthArr;
}
export const FlatGrid: FunctionComponent<
	{
		width: number;
		depth: number;
		z?: number;
		resolution?: number;
	} & Pick<React.SVGProps<SVGLineElement>, 'stroke' | 'strokeWidth'>
> = ({ width, depth: height, z = 0, resolution = 1, strokeWidth, stroke }) => {
	return (
		<>
			{[
				...arrayOfLength(width).map(x => {
					const start = perspective.toPixels(x * resolution, 0, z);
					const end = perspective.toPixels(x * resolution, (height - 1) * resolution, z);
					return (
						<line
							key={'x' + x}
							x1={start[0]}
							y1={start[1]}
							x2={end[0]}
							y2={end[1]}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					);
				}),
				...arrayOfLength(height).map(y => {
					const start = perspective.toPixels(0, y * resolution, z);
					const end = perspective.toPixels((width - 1) * resolution, y * resolution, z);
					return (
						<line
							key={'y' + y}
							x1={start[0]}
							y1={start[1]}
							x2={end[0]}
							y2={end[1]}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					);
				})
			]}
		</>
	);
};

const DrawHeightGrid: FunctionComponent<{
	width: number;
	height: number;
	zValues: number[];
	resolution?: number;
	strokeWidth: number;
	stroke: string;
}> = ({ width, height, zValues, resolution = 4, strokeWidth, stroke }) => {
	return (
		<>
			{[
				...arrayOfLength(width).map(x => {
					return (
						<polyline
							key={'x' + x}
							points={arrayOfLength(height)
								.map(y => {
									const z = zValues[x * height + y];
									return perspective.toPixels(
										x * resolution,
										y * resolution,
										z
									).join(',');
								})
								.join(' ')}
							fill={'none'}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					);
				}),
				...arrayOfLength(height).map(y => {
					return (
						<polyline
							key={'y' + y}
							points={arrayOfLength(width)
								.map(x => {
									const z = zValues[x * height + y];
									return perspective.toPixels(
										x * resolution,
										y * resolution,
										z
									).join(',');
								})
								.join(' ')}
							fill={'none'}
							stroke={stroke}
							strokeWidth={strokeWidth}
						/>
					);
				})
			]}
		</>
	);
};

const DrawPoints: FunctionComponent<{
	coords: Coordinate[];
	resolution: number;
	zLineStroke: string;
	zLineStrokeWidth: number;
	zDotRadius: number;
	zDotFill: string;
}> = ({
	coords,
	resolution = 4,
	zLineStroke,
	zLineStrokeWidth = 0,
	zDotRadius = 0,
	zDotFill = null
}) => {
	return (
		<>
			{coords.map(coord => {
				const start = perspective.toPixels(
					coord.x * resolution,
					coord.y * resolution,
					coord.z
				);
				const end = perspective.toPixels(coord.x * resolution, coord.y * resolution, 0);

				return [
					zLineStrokeWidth && (
						<line
							key={coord.x + ',' + coord.y + '-line'}
							x1={start[0]}
							y1={start[1]}
							x2={end[0]}
							y2={end[1]}
							stroke={zLineStroke}
							strokeWidth={zLineStrokeWidth}
						/>
					),
					zDotFill && (
						<circle
							key={coord.x + ',' + coord.y}
							cx={start[0]}
							cy={start[1]}
							r={zDotRadius}
							fill={zDotFill}
						/>
					)
				];
			})}
		</>
	);
};

export const Grid: FunctionComponent<{
	width?: number;
	height?: number;
	resolution?: number;
	zStroke?: string;
	zStrokeWidth?: number;
	zLineStroke?: string;
	zLineStrokeWidth?: number;
	flatGridStroke?: string;
	flatGridStrokeWidth?: number;
	gridStroke?: string;
	gridStrokeWidth?: number;
	zDotFill?: string;
	zDotRadius?: number;
	maxZ?: number;
	smoothingIterations?: number;
	smoothingForce?: number;
	maxZCutoff?: number;
	minZCutoff?: number;
}> = ({
	width = 10,
	height = 10,
	resolution = 1,
	zLineStroke = 'rgba(0, 0, 0, 0.3)',
	zLineStrokeWidth = 0.25,
	flatGridStroke = 'rgba(0, 0, 0, 0.3)',
	flatGridStrokeWidth = 0.5,
	gridStroke = 'rgba(0, 0, 0, 0.5)',
	gridStrokeWidth = 1,
	zDotFill = 'rgba(0,0,0,1)',
	zDotRadius = 2,
	maxZ = 0,
	smoothingIterations = 0,
	smoothingForce = 0.9,
	maxZCutoff = Infinity,
	minZCutoff = -Infinity
}) => {
	const coords = Array.from(Array(smoothingIterations))
		.reduce<Coordinate[]>(
			lastNerf =>
				lastNerf.map(coord => {
					const neighbourAverageZ = lastNerf
						.filter(c => coord.manhattanDistanceTo(c) <= 4.3 && !c.equals(coord))
						.reduce(
							(total, coord, i, all) =>
								i === all.length - 1
									? (total + coord.z) / all.length
									: total + coord.z,
							0
						);
					return new Coordinate(
						coord.x,
						coord.y,
						(1 - smoothingForce) * coord.z + smoothingForce * neighbourAverageZ
					);
				}),
			arrayOfLength(width).reduce<Coordinate[]>(
				(all, x) =>
					all.concat(
						arrayOfLength(height).map(
							y =>
								new Coordinate(
									x,
									y,
									Math.pow(Math.pow(Math.random() * 1.2, 3) * 1.1, 9) * maxZ
								)
						)
					),
				[]
			)
		)
		.map(c => new Coordinate(c.x, c.y, Math.min(Math.max(c.z, minZCutoff), maxZCutoff)));

	const avgZ = coords.reduce(
		(total, coord, i, all) =>
			i === all.length - 1 ? (total + coord.z) / all.length : total + coord.z,
		0
	);
	return (
		<Anchor>
			<Anchor>
				<FlatGrid
					width={width}
					depth={height}
					resolution={resolution}
					stroke={flatGridStroke}
					strokeWidth={flatGridStrokeWidth}
				/>
			</Anchor>

			<g>
				<DrawHeightGrid
					width={width}
					height={height}
					resolution={resolution}
					stroke={gridStroke}
					strokeWidth={gridStrokeWidth}
					zValues={coords.map(coord => coord.z - avgZ)}
				/>
			</g>
			<Anchor>
				<DrawPoints
					resolution={resolution}
					zLineStroke={zLineStroke}
					zLineStrokeWidth={zLineStrokeWidth}
					zDotFill={zDotFill}
					zDotRadius={zDotRadius}
					coords={coords.map(c => Coordinate.clone(c).transform(0, 0, -avgZ))}
				/>
			</Anchor>
		</Anchor>
	);
};
