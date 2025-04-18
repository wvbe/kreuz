import type { Meta, StoryObj } from '@storybook/react';
import { FancyClock } from './FancyClock';

const meta: Meta<typeof FancyClock> = {
	title: 'Clock/FancyClock',
	component: FancyClock,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		style: {
			description: 'The style of the clock',
			options: ['skeuomorphic', 'flat'],
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FancyClock>;

export const Default: Story = {
	args: {
		time: 500, // Half past midnight
		onTimeSpeedChange: (speed) => console.log('Time speed changed to:', speed),
		style: 'skeuomorphic',
	},
};

export const Midnight: Story = {
	args: {
		time: 0,
		onTimeSpeedChange: (speed) => console.log('Time speed changed to:', speed),
	},
};

export const OneHour: Story = {
	args: {
		time: 1000,
		onTimeSpeedChange: (speed) => console.log('Time speed changed to:', speed),
	},
};
