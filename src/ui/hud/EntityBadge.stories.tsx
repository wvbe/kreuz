import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { EntityBadge } from './EntityBadge';

export default {
	title: 'UI/HUD/EntityBadge',
	component: EntityBadge,
} as Meta;

const Template: StoryFn = (args: any) => <EntityBadge {...args} />;

export const Default = Template.bind({});
Default.args = {
	icon: '🔍',
	title: 'Default Title',
	subtitle: 'Default Subtitle',
};

export const WithEmojiIcon = Template.bind({});
WithEmojiIcon.args = {
	icon: '🌟',
	title: 'Star Entity',
	subtitle: 'This entity is special',
};

export const WithReactNodeIcon = Template.bind({});
WithReactNodeIcon.args = {
	icon: (
		<span role='img' aria-label='rocket'>
			🚀
		</span>
	),
	title: 'Rocket Entity',
	subtitle: 'This entity is fast',
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
	title: 'No Icon',
	subtitle: 'This entity has no icon',
	hideIcon: true,
};
