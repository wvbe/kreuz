import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';

const meta: Meta = {
	title: 'Demo',
	component: scenarios.DualMesh,
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

export const SVG: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => <scenarios.DualMesh {...args} asIsometric={true} />;
export const THREE: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => <scenarios.DualMesh {...args} asIsometric={false} />;
