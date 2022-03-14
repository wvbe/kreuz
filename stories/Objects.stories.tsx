import { Meta, Story } from '@storybook/react';
import React, { ComponentType, FunctionComponent, useCallback, useState } from 'react';
import { Coordinate } from '../src/classes/Coordinate';
import { BuildingEntity } from '../src/entities/BuildingEntity';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { SettlementEntity } from '../src/entities/SettlementEntity';
import { TreeEntity } from '../src/entities/TreeEntity';
import { scenarios } from '../src/index';
import { RendererDetail } from '../src/rendering/RendererDetail';
import { createEntityObject } from '../src/rendering/threejs/entities';
import { ThreeController } from '../src/rendering/threejs/ThreeController';
import { GenericTile } from '../src/terrain/GenericTile';
import { SeedI } from '../src/types';
import { Backdrop } from './util';

const meta: Meta = {
	title: 'Objects',
	argTypes: {
		children: {
			control: {
				type: 'text'
			}
		}
	},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

const CAMERA_POSITION = new Coordinate(-1, 1, 1);
const CAMERA_FOCUS = new Coordinate(0, 0, 0.25);

function makeStory(
	label: string,
	maker: (controller: ThreeController, seed: string) => () => void
) {
	const story: Story = () => {
		const [seed, setSeed] = useState('test');
		const build = useCallback(controller => maker(controller, seed), [seed]);

		return (
			<Backdrop height={'100vh'} padding={0}>
				<RendererDetail build={build} />
				<div style={{ position: 'absolute', top: '1em', left: '1em' }}>
					<button
						onClick={() => {
							const newSeed = String(Date.now());
							console.log(`Setting new seed to ${newSeed}`);
							setSeed(newSeed);
						}}
					>
						Random seed
					</button>
				</div>
			</Backdrop>
		);
	};
	story.storyName = label;

	return story;
}

export const guardStory = makeStory('Guard', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(createEntityObject(new GuardEntity(seed, new GenericTile(0, 0, 0))));
	return () => {};
});
export const civvy = makeStory('Civvy', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(createEntityObject(new CivilianEntity(seed, new GenericTile(0, 0, 0))));
	return () => {};
});
export const building = makeStory('Building', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(createEntityObject(new BuildingEntity(seed, new GenericTile(0, 0, 0))));
	return () => {};
});
export const settlement = makeStory('Settlement', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(
		createEntityObject(
			new SettlementEntity(seed, new GenericTile(0, 0, 0), {
				areaSize: 1,
				minimumBuildingLength: 0.3,
				scale: 1
			})
		)
	);
	return () => {};
});
export const forest = makeStory('Forest', (controller, seed) => {
	controller.setCameraPosition(CAMERA_POSITION);
	controller.setCameraFocus(CAMERA_FOCUS);
	controller.addAxisHelper(undefined, 1);
	controller.scene.add(createEntityObject(new TreeEntity(seed, new GenericTile(0, 0, 0))));
	return () => {};
});
