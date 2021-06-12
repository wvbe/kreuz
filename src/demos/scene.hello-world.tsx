import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Scene } from '../classes/Scene';
import { TerrainCoordinateComponent } from '../classes/TerrainCoordinate';
import { Entity } from '../entities/Entity';
import { PersonEntity, PersonEntityComponent } from '../entities/PersonEntity';
import { Viewport } from '../space/Viewport';
import { ActiveEntityOverlay } from '../ui/ActiveEntityOverlay';

const WORLD_SIZE = 40;

const Demo: FunctionComponent = () => {
	const scene = useMemo(() => {
		const scene = Scene.generateRandom(WORLD_SIZE);
		(window as any).scene = scene;
		return scene;
	}, []);

	const terrain = useMemo(
		() =>
			scene.terrain.getCoordinatesInRenderOrder().map((terrainCoordinate) => (
				<TerrainCoordinateComponent
					key={terrainCoordinate.toString()}
					terrainCoordinate={terrainCoordinate}
					onClick={(event) => {
						event.preventDefault();
						setCenter(terrainCoordinate);
					}}
				/>
			)),
		[scene.terrain]
	);

	const [center, setCenter] = useState(
		scene.terrain.getAtXy(Math.floor(WORLD_SIZE / 2), Math.floor(WORLD_SIZE / 2))
	);

	const [activeEntity, setActiveEntity] = useState<Entity | undefined>(undefined);

	const entities = useMemo(
		() =>
			scene.entities
				.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
				.map((entity) => (
					<PersonEntityComponent
						key={entity.id}
						entity={entity}
						onClick={(event) => {
							event.preventDefault();
							setActiveEntity(entity);
						}}
					/>
				)),
		[scene.entities]
	);

	// Make all the things move!
	useEffect(() => scene.play(), [scene]);

	return (
		<>
			<Viewport center={center} zoom={1}>
				<g id="scene-terrain">{terrain}</g>
				<g id="scene-entities">{entities}</g>
			</Viewport>
			<ActiveEntityOverlay entity={activeEntity} />
		</>
	);
};

export default Demo;
