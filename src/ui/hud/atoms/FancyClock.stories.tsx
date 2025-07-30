import type { Meta, StoryObj } from '@storybook/react';
import { FancyClock } from './FancyClock';

const meta: Meta<typeof FancyClock> = {
	title: 'UI/HUD/Atoms/FancyClock',
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
type StoryFn = StoryObj<typeof FancyClock>;

export const Default: StoryFn = {
	args: {
		time: 500, // Half past midnight

		style: 'skeuomorphic',
	},
};

export const Midnight: StoryFn = {
	args: {
		time: 0,
	},
};

export const OneHour: StoryFn = {
	args: {
		time: 1000,
	},
};
