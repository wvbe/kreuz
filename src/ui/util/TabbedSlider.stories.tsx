import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import TabbedSlider, { TabbedSliderProps } from './TabbedSlider';

export default {
	title: 'UI/Util/TabbedSlider',
	component: TabbedSlider,
} as Meta;

const Template: StoryFn<TabbedSliderProps> = (args) => <TabbedSlider {...args} />;

export const Default = Template.bind({});
Default.args = {
	tabs: [
		{
			label: 'Tab 1',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 1 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 2',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 2 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 3',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 3 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 4',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 4 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 5',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 5 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 6',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 6 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
		{
			label: 'Tab 7',
			Content: ({ isActive, isVisible }: { isActive: boolean; isVisible: boolean }) => (
				<div>
					Content for Tab 7 - Active: {isActive.toString()}, Visible:{' '}
					{isVisible.toString()}
				</div>
			),
		},
	],
};
