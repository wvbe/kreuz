import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { RoundGlass } from './RoundGlass';

export default {
	title: 'UI/RoundGlass',
	component: RoundGlass,
	args: {
		size: '128px',
	},
} as Meta;

const Template: StoryFn = (args: any) => <RoundGlass {...args} />;

export const Empty = Template.bind({});
Empty.args = {
	children: <></>,
};

export const WithRandomEmoji = Template.bind({});
WithRandomEmoji.args = {
	background: 'linear-gradient(0deg,rgb(206, 101, 105) 0%, #fad0c4 100%)',
	children: <>🏔️</>,
};

export const WithEntity = Template.bind({});
WithEntity.args = {
	background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
	children: <span style={{ fontSize: '0.4em' }}>🧔‍♂️</span>,
};
