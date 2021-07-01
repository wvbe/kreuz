import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { Coordinate, CoordinateArray } from '../classes/Coordinate';
import { PERSPECTIVE } from '../space/PERSPECTIVE';
import { Viewport } from '../space/Viewport';

const Region: FunctionComponent<{ center: CoordinateArray; nodes: CoordinateArray[] }> = ({
	center,
	nodes
}) => {
	return (
		<polyline
			fill="rgba(0,0,0,0.1)"
			stroke="black"
			points={[...nodes, nodes[0]]
				.map(n => PERSPECTIVE.toPixels(n[0], n[1], 0).join(','))
				.join(' ')}
		/>
	);
};
const TerrainMesh: FunctionComponent = () => {
	const { mesh, points } = useMemo(() => {
		// new MeshBuilder({ boundarySpacing: 75 }).addPoisson(Poisson, 75).create();
		const poisson = new Poisson(
			{
				shape: [64, 64],
				minDistance: 2
			},
			Math.random
		);
		const mesh = new MeshBuilder({ boundarySpacing: 2 });

		mesh.points.forEach((p: [number, number]) => poisson.addPoint(p));
		mesh.points = poisson.fill().map((xy: [number, number]) => [...xy, 0]);

		return {
			mesh: mesh.create(),
			points: mesh.points
		};
	}, []);
	const [center] = useState(new Coordinate(32, 32, 0));

	return (
		<Viewport center={center} zoom={1}>
			{points.map((point: CoordinateArray, i: number) => {
				return (
					<Region
						key={point.join('/')}
						center={point}
						nodes={mesh
							.r_circulate_t([], i)
							.map((i: number) => [mesh.t_x(i), mesh.t_y(i)])}
					/>
				);
			})}
		</Viewport>
	);
};

export default TerrainMesh;
