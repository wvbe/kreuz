import { Meta, Story } from '@storybook/react';
import React from 'react';
import EntityControls from './EntityControls';

export default {
	title: 'HUD/EntityControls',
	component: EntityControls,
} as Meta;

const Template: Story = (args) => <EntityControls {...args} />;

export const Frodo = Template.bind({});
Frodo.args = {
	visual: '💅',
	entityInfo: [
		{ key: 'Name', value: 'Frodo Baggins' },
		{ key: 'Race', value: 'Hobbit' },
		{ key: 'Role', value: 'Ring Bearer' },
	],
	actions: [
		{ label: 'Inspect', onClick: () => alert('Inspecting Frodo') },
		{ label: 'Follow', onClick: () => alert('Following Frodo') },
	],
};

export const Gandalf = Template.bind({});
Gandalf.args = {
	visual: '🧙‍♂️',
	entityInfo: [
		{ key: 'Name', value: 'Gandalf the Grey' },
		{ key: 'Race', value: 'Maia' },
		{ key: 'Role', value: 'Wizard' },
	],
	actions: [
		{ label: 'Inspect', onClick: () => alert('Inspecting Gandalf') },
		{ label: 'Follow', onClick: () => alert('Following Gandalf') },
	],
};

export const Aragorn = Template.bind({});
Aragorn.args = {
	visual: '🤴',
	entityInfo: [
		{ key: 'Name', value: 'Aragorn' },
		{ key: 'Race', value: 'Human' },
		{ key: 'Role', value: 'King of Gondor' },
	],
	actions: [
		{ label: 'Inspect', onClick: () => alert('Inspecting Aragorn') },
		{ label: 'Follow', onClick: () => alert('Following Aragorn') },
	],
};
