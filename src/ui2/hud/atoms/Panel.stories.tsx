import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { Panel } from './Panel';

export default {
	title: 'UI/Panel',
	component: Panel,
	args: {
		size: '128px',
	},
} as Meta;

const Template: StoryFn = (args: any) => <Panel {...args} />;

export const Empty = Template.bind({});
Empty.args = {
	children: (
		<>
			<p>Skibidi bop bop</p>
		</>
	),
};
