import { Meta, Story } from '@storybook/react';
import React, { ComponentType } from 'react';
import { Coordinate } from '../src/classes/Coordinate';
import { BuildingEntity } from '../src/entities/BuildingEntity';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { TreeEntity } from '../src/entities/TreeEntity';
import { scenarios } from '../src/index';
import { RendererDetail } from '../src/rendering/RendererDetail';
import { createEntityObject } from '../src/rendering/threejs/entities';
import { GenericTile } from '../src/terrain/GenericTile';
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

export const guardEntity: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => (
	<Backdrop height={'100vh'} padding={0}>
		<RendererDetail
			build={controller => {
				controller.setCameraPosition(CAMERA_POSITION);
				controller.setCameraFocus(CAMERA_FOCUS);
				controller.addAxisHelper(undefined, 1);
				controller.scene.add(
					createEntityObject(new GuardEntity('test', new GenericTile(0, 0, 0)))
				);
				return () => {};
			}}
		/>
	</Backdrop>
);
guardEntity.storyName = 'GuardEntity';

export const e2: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
		<Backdrop height={'100vh'} padding={0}>
			<RendererDetail
				build={controller => {
					controller.setCameraPosition(CAMERA_POSITION);
					controller.setCameraFocus(CAMERA_FOCUS);
					controller.addAxisHelper(undefined, 1);
					controller.scene.add(
						createEntityObject(new CivilianEntity('test', new GenericTile(0, 0, 0)))
					);
					return () => {};
				}}
			/>
		</Backdrop>
	);
e2.storyName = 'CivilianEntity';

export const e3: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
		<Backdrop height={'100vh'} padding={0}>
			<RendererDetail
				build={controller => {
					controller.setCameraPosition(CAMERA_POSITION);
					controller.setCameraFocus(CAMERA_FOCUS);
					controller.addAxisHelper(undefined, 1);
					controller.scene.add(
						createEntityObject(new BuildingEntity('test', new GenericTile(0, 0, 0)))
					);
					return () => {};
				}}
			/>
		</Backdrop>
	);
e3.storyName = 'BuildingEntity';

export const e4: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
		<Backdrop height={'100vh'} padding={0}>
			<RendererDetail
				build={controller => {
					controller.setCameraPosition(CAMERA_POSITION);
					controller.setCameraFocus(CAMERA_FOCUS);
					controller.addAxisHelper(undefined, 1);
					controller.scene.add(
						createEntityObject(new TreeEntity('test', new GenericTile(0, 0, 0)))
					);
					return () => {};
				}}
			/>
		</Backdrop>
	);
e4.storyName = 'TreeEntity';
