import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { Tab } from '../util/TabbedSlider';
import EntityControls from './EntityControls';

export default {
	title: 'HUD/EntityControls',
	component: EntityControls,
} as Meta;

const Template: StoryFn = (args: any) => <EntityControls {...args} />;

const exampleTabs: Tab[] = [
	{
		label: 'Tab 1',
		Content: ({ isActive, isVisible }) => (
			<div>
				Tab 1 Content - Active: {isActive.toString()}, Visible: {isVisible.toString()}
			</div>
		),
	},
	{
		label: 'Tab 2',
		Content: ({ isActive, isVisible }) => (
			<div>
				Tab 2 Content - Active: {isActive.toString()}, Visible: {isVisible.toString()}
			</div>
		),
	},
];

export const Frodo = Template.bind({});
Frodo.args = {
	visual: '💅',
	entityInfo: [
		{ key: 'Name', value: 'Frodo Baggins' },
		{ key: 'Race', value: 'Hobbit' },
		{ key: 'Role', value: 'Ring Bearer' },
	],
	tabs: exampleTabs,
};

export const Gandalf = Template.bind({});
Gandalf.args = {
	visual: '🧙‍♂️',
	entityInfo: [
		{ key: 'Name', value: 'Gandalf the Grey' },
		{ key: 'Race', value: 'Maia' },
		{ key: 'Role', value: 'Wizard' },
	],
	tabs: exampleTabs,
};

export const Aragorn = Template.bind({});
Aragorn.args = {
	visual: '🤴',
	entityInfo: [
		{ key: 'Name', value: 'Aragorn' },
		{ key: 'Race', value: 'Human' },
		{ key: 'Role', value: 'King of Gondor' },
	],
	tabs: exampleTabs,
};
