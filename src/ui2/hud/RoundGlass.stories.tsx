import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { RoundGlass } from './RoundGlass';

export default {
	title: 'UI/RoundGlass',
	component: RoundGlass,
} as Meta;

const Template: StoryFn = (args: any) => <RoundGlass {...args} />;

export const WithEmojis = Template.bind({});
WithEmojis.args = {
	children: <>😊</>,
};

export const WithRocket = Template.bind({});
WithRocket.args = {
	background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
	children: (
		<span style={{ fontSize: '80px', lineHeight: '80px' }} role='img' aria-label='rocket'>
			🚀
		</span>
	),
};

export const WithStar = Template.bind({});
WithStar.args = {
	background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
	children: (
		<span style={{ fontSize: '80px', lineHeight: '80px' }} role='img' aria-label='star'>
			⭐
		</span>
	),
};

export const WithHeart = Template.bind({});
WithHeart.args = {
	background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
	children: (
		<span style={{ fontSize: '80px', lineHeight: '80px' }} role='img' aria-label='heart'>
			❤️
		</span>
	),
};
