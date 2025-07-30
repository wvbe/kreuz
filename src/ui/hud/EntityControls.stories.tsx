import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { Tab } from '../util/TabbedSlider';
import EntityControls from './EntityControls';

export default {
	title: 'UI/HUD/EntityControls',
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

export const FlumboZibble = Template.bind({});
FlumboZibble.args = {
	icon: '💅',
	title: 'Flumbo Zibble',
	subtitle: 'Zibblewump',
	entityInfo: [
		{ key: 'Role', value: 'Zibblewump Flarn' },
		{ key: 'Status', value: 'Snorfleblat glibberflop' },
	],
	tabs: exampleTabs,
};

export const GloffleTheBlib = Template.bind({});
GloffleTheBlib.args = {
	icon: '🧙‍♂️',
	title: 'Gloffle the Blib',
	subtitle: 'Flibberflop',
	entityInfo: [
		{ key: 'Role', value: 'Wizzlefump' },
		{ key: 'Status', value: 'Fizzlenarf blorptwizzle' },
	],
	tabs: exampleTabs,
};

export const Snorvax = Template.bind({});
Snorvax.args = {
	icon: '💎',
	title: 'Snorvax',
	subtitle: 'Squibblewump',
	entityInfo: [
		{ key: 'Role', value: 'Snarfleblat of Blorptown' },
		{ key: 'Status', value: 'Grizzlewump turned flarnblat' },
	],
	tabs: exampleTabs,
};

export const Twizzlefip = Template.bind({});
Twizzlefip.args = {
	icon: '🏹',
	title: 'Twizzlefip',
	subtitle: 'Glibberflop',
	entityInfo: [
		{ key: 'Role', value: 'Twizzleflarn' },
		{ key: 'Status', value: 'Snorfleblat blorpcounter' },
	],
	tabs: exampleTabs,
};

export const Blimbo = Template.bind({});
Blimbo.args = {
	icon: '🪓',
	title: 'Blimbo',
	subtitle: 'Bibblewump',
	entityInfo: [
		{ key: 'Role', value: 'Wompleblat' },
		{ key: 'Status', value: 'Flarn maintenance snorfle' },
	],
	tabs: exampleTabs,
};

export const SnarfleSnib = Template.bind({});
SnarfleSnib.args = {
	icon: '🥘',
	title: 'Snarfle Snib',
	subtitle: 'Zibblewump',
	entityInfo: [
		{ key: 'Role', value: 'Gribbleflarn' },
		{ key: 'Status', value: 'Potato snarfleblat' },
	],
	tabs: exampleTabs,
};

export const Glompo = Template.bind({});
Glompo.args = {
	icon: '🐟',
	title: 'Glompo',
	subtitle: 'Stoor Zibblewump',
	entityInfo: [
		{ key: 'Role', value: 'Ring snarfle' },
		{ key: 'Status', value: 'Flish blorptwizzle' },
	],
	tabs: exampleTabs,
};
