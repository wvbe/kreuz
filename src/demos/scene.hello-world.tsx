import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Scene } from '../classes/Scene';
import { Entity } from '../entities/Entity';
import { PersonEntity, PersonEntityComponent } from '../entities/PersonEntity';
import { Viewport } from '../space/Viewport';
import { ActiveEntityOverlay } from '../ui/ActiveEntityOverlay';
import {
	ContextMenuButton,
	ContextMenuContainer,
	ContextMenuContext,
	ContextMenuFooter,
	ContextMenuManager
} from '../ui/ContextMenu';
import { Overlay } from '../ui/Overlay';

const WORLD_SIZE = 32;

function fancyTimeFormat(seconds: number) {
	// Output like "1:01" or "4:03:59" or "123:03:59"
	return `${~~((seconds % 3600) / 60)}′ ${seconds % 60}″`;
}
function fakeCoordinates(x: number, y: number) {
	return `40° ${fancyTimeFormat(1000 - x)} N 79° ${fancyTimeFormat(700 - y)} W`;
}

const Demo: FunctionComponent = () => {
	const scene = useMemo(() => {
		const scene = Scene.generateRandom(String(Date.now()), WORLD_SIZE);
		(window as any).scene = scene;
		return scene;
	}, []);

	const contextManager = useMemo(() => new ContextMenuManager(), []);

	const [center, setCenter] = useState(
		scene.terrain.getClosestToXy(Math.floor(WORLD_SIZE / 2), Math.floor(WORLD_SIZE / 2))
	);

	const [activeEntity, setActiveEntity] = useState<Entity | undefined>(undefined);

	const terrain = useMemo(
		() => (
			<scene.terrain.Component
				onTileClick={(event, tile) => {
					contextManager.invoke(
						tile,
						<>
							<ContextMenuButton onClick={() => setCenter(tile)}>
								Center camera
							</ContextMenuButton>
							<ContextMenuFooter>{fakeCoordinates(tile.x, tile.y)}</ContextMenuFooter>
						</>
					);
				}}
				onTileContextMenu={(event, tile) => {
					setCenter(tile);
				}}
			/>
		),
		[scene, contextManager]
	);

	const entities = useMemo(
		() =>
			scene.entities
				.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
				.map(entity => (
					<PersonEntityComponent
						key={entity.id}
						entity={entity}
						onClick={event => {
							event.preventDefault();
							setActiveEntity(entity);
						}}
					/>
				)),
		[scene.entities]
	);

	// Make all the things move!
	useEffect(() => scene.play(), [scene]);

	useEffect(() => {
		const cb = () => {
			contextManager.close();
		};

		window.addEventListener('click', cb);
		return () => window.removeEventListener('click', cb);
	}, [contextManager]);

	return (
		<ContextMenuContext.Provider value={contextManager}>
			<Viewport center={center} zoom={1} overlay={<ContextMenuContainer zoom={1} />}>
				<g id="scene__terrain">{terrain}</g>
				<g id="scene__entities">{entities}</g>
			</Viewport>
			<Overlay>
				<ActiveEntityOverlay entity={activeEntity} />
				<p style={{ fontSize: '0.8em', opacity: '0.5' }}>
					<a
						href="https://github.com/wvbe/kreuzzeug-im-nagelhosen"
						target="_blank"
						rel="noreferrer"
					>
						GitHub
					</a>
					{'    '}
					Seed: {scene.seed}
				</p>
			</Overlay>
		</ContextMenuContext.Provider>
	);
};

export default Demo;
