import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';

const meta: Meta = {
	title: 'Demos',
	component: scenarios.DualMesh,
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

const DOPE_SEEDS = [1647022336452];
const POSSIBLY_BROKEN_SEEDS = [1647039315571];
const MAIN_DEMO_SEED = DOPE_SEEDS[0];

export const THREE: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => <scenarios.DualMesh {...args} asIsometric={false} seed={MAIN_DEMO_SEED} />;
THREE.storyName = 'Three.js';

export const THREE_D: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => <scenarios.DualMesh {...args} asIsometric={false} seed={POSSIBLY_BROKEN_SEEDS[0]} />;
THREE_D.storyName = 'Three.js (debug)';

export const THREE_R: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => <scenarios.DualMesh {...args} asIsometric={false} />;
THREE_R.storyName = 'Three.js (random)';

export const SVG: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => <scenarios.DualMesh {...args} asIsometric={true} seed={MAIN_DEMO_SEED} />;
