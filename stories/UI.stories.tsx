import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';
import { ActiveEntityOverlay } from '../src/ui/ActiveEntityOverlay';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { GenericTile } from '../src/terrain/GenericTile';

const meta: Meta = {
	title: 'UI',
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

export const ActiveEntity: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => <ActiveEntityOverlay entity={new GuardEntity('test', new GenericTile(0, 0, 0))} />;
