import { Meta, Story } from '@storybook/react';
import React from 'react';
import { Backdrop } from './util';
import { Anchor } from '../src/rendering/svg/Anchor';
import { SimpleRectangle } from '../src/rendering/svg/SimpleRectangle';
import { Viewport } from '../src/rendering/svg/Viewport';
import { Coordinate } from '../src/classes/Coordinate';
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
	<Backdrop height={360}>
		<Viewport center={new Coordinate(3.75, 3.75, 0.5)}>
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
