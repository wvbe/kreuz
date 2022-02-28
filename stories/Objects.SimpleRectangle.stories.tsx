import { Meta, Story } from '@storybook/react';
import React from 'react';
import { Backdrop } from '../src/scenarios/util';
import { Anchor } from '../src/space/Anchor';
import { SimpleRectangle } from '../src/space/SimpleRectangle';
import { Viewport } from '../src/space/Viewport';
const meta: Meta = {
	title: 'Objects/SimpleRectangle',
	component: SimpleRectangle,
	argTypes: {},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

export const differentSizes: Story = args => (
	<Backdrop>
		<Viewport center={{ x: 3.75, y: 3.75, z: 0.5 }}>
			<Anchor x={0} y={0} z={0}>
				<SimpleRectangle />
			</Anchor>
			<Anchor x={2} y={2} z={0}>
				<SimpleRectangle width={2} />
			</Anchor>
			<Anchor x={4} y={4} z={0}>
				<SimpleRectangle height={2} />
			</Anchor>
			<Anchor x={6} y={6} z={0}>
				<SimpleRectangle length={2} />
			</Anchor>
		</Viewport>
	</Backdrop>
);
