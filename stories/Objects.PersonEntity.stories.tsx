import { Meta, Story } from '@storybook/react';
import React from 'react';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { PersonEntityC } from '../src/entities/PersonEntityC';
import { Backdrop } from '../src/scenarios/util';
import { Viewport } from '../src/rendering/svg/Viewport';
import { GenericTile } from '../src/terrain/GenericTile';

const meta: Meta = {
	title: 'Objects/Entities',
	component: PersonEntityC,
	argTypes: {},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

export const civilianPerson: Story = args => {
	const entity = new CivilianEntity('test', new GenericTile(0, 0, 0));
	return (
		<Backdrop>
			<Viewport zoom={1} center={{ x: 0, y: 0, z: 0 }}>
				<entity.Component />
			</Viewport>
		</Backdrop>
	);
};
export const guardPerson: Story = args => {
	const entity = new GuardEntity('test', new GenericTile(0, 0, 0));
	return (
		<Backdrop>
			<Viewport zoom={1} center={{ x: 0, y: 0, z: 0 }}>
				<entity.Component />
			</Viewport>
		</Backdrop>
	);
};
