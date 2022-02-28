import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';

const meta: Meta = {
	title: 'Demo',
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

export const DualMesh: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => <scenarios.DualMesh {...args} />;
