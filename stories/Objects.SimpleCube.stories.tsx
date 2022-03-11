import { Meta, Story } from '@storybook/react';
import Color from 'color';
import React from 'react';
import { Backdrop } from './util';
import { Anchor } from '../src/rendering/svg/Anchor';
import { SimpleCube } from '../src/rendering/svg/SimpleCube';
import { Viewport } from '../src/rendering/svg/Viewport';

const meta: Meta = {
	title: 'Objects/SimpleCube',
	component: SimpleCube,
	argTypes: {},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

export const differentColors: Story = args => (
	<Backdrop height={360}>
		<Viewport zoom={1} center={{ x: 0.5, y: 0.5, z: 0.5 }}>
			<Anchor x={-2} y={-2} z={0}>
				<SimpleCube />
			</Anchor>
			<Anchor x={0} y={0} z={0}>
				<SimpleCube innerStroke={Color('#630a0a7d')} fill={Color('#960202')} />
			</Anchor>
			<Anchor x={2} y={2} z={0}>
				<SimpleCube
					fill={Color('#ffffff7f')}
					onClick={() => window.alert('Clicky click!')}
				/>
			</Anchor>
		</Viewport>
	</Backdrop>
);

export const differentSizes: Story = args => (
	<Backdrop height={360}>
		<Viewport center={{ x: 5, y: 0, z: 0.5 }}>
			<Anchor x={0} y={0} z={0}>
				<SimpleCube size={0.1} />
			</Anchor>
			<Anchor x={2} y={0} z={0}>
				<SimpleCube size={0.5} />
			</Anchor>
			<Anchor x={4} y={0} z={0}>
				<SimpleCube size={1} />
			</Anchor>
			<Anchor x={6} y={0} z={0}>
				<SimpleCube size={2} />
			</Anchor>
		</Viewport>
	</Backdrop>
);

export const adjacentBoxes: Story = args => (
	<Backdrop height={360}>
		<Viewport center={{ x: 1, y: 0, z: 0.5 }}>
			<Anchor x={0} y={0} z={0}>
				<SimpleCube />
			</Anchor>
			<Anchor x={1} y={0} z={0}>
				<SimpleCube />
			</Anchor>
			<Anchor x={2} y={0} z={0}>
				<SimpleCube />
			</Anchor>
			<Anchor x={2} y={-1} z={0}>
				<SimpleCube />
			</Anchor>
		</Viewport>
	</Backdrop>
);
