import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { Viewport } from '../space/Viewport';

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
			{/* {points.map((point: CoordinateArray, i: number) => {
				return (
					<DualMeshTileComponent
						key={point.join('/')}
						tile={point}
						nodes={mesh
							.r_circulate_t([], i)
							.map((i: number) => [mesh.t_x(i), mesh.t_y(i)])}
					/>
				);
			})} */}
		</Viewport>
	);
};

export default TerrainMesh;
