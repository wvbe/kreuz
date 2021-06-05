import { Meta, Story } from '@storybook/react';
import React, { useMemo } from 'react';
import { Generator, Ui } from '../src/index';

const meta: Meta = {
	title: 'Demo',
	args: {
		seed: 'test'
	}
};

export default meta;

type Props = {
	seed: string;
} & Parameters<typeof Generator.randomGame>[1];
export const Demo: Story<Props> = args => {
	const game = useMemo(() => {
		const { seed, ...options } = args;
		console.log(seed, options);
		return Generator.randomGame(seed, options);
	}, [args]);
	return <Ui game={game} />;
};
Demo.args = { density: 1, size: 20, seed: 'test' };

// export const THREE_D: Story<Props> = args => (
// 	<scenarios.DualMesh {...args} seed={POSSIBLY_BROKEN_SEEDS[0]} />
// );
// THREE_D.storyName = 'Three.js (debug)';

// export const THREE_R: Story<Props> = args => <scenarios.DualMesh {...args} />;
// THREE_R.storyName = 'Three.js (random)';
