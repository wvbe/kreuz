import { Meta, Story } from '@storybook/react';
import React from 'react';
import { InventoryStack } from './InventoryStack';

export default {
	title: 'HUD/InventoryStack',
	component: InventoryStack,
} as Meta;

const Template: Story<{ icon: string; label: string; quantity: number; isGhost?: boolean }> = (
	args,
) => <InventoryStack {...args} />;

export const Default = Template.bind({});
Default.args = {
	icon: '🪨',
	label: 'Stone',
	quantity: 10,
};

export const Ghost = Template.bind({});
Ghost.args = {
	icon: '🪵',
	label: 'Wood',
	quantity: 5,
	isGhost: true,
};

export const Empty = Template.bind({});
Empty.args = {
	icon: '',
	label: '',
	quantity: 0,
};

export const InfiniteQuantity = Template.bind({});
InfiniteQuantity.args = {
	icon: '🥇',
	label: 'Gold',
	quantity: Infinity,
};
