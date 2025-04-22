import { Meta, Story } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { PopOnUpdateSpan } from './PopOnUpdateSpan';

export default {
	title: 'UI/PopOnUpdateSpan',
	component: PopOnUpdateSpan,
} as Meta;

const Template: Story = (args) => {
	const [text, setText] = useState('Initial Text');

	useEffect(() => {
		const interval = setInterval(() => {
			setText(`Random Value: ${Math.floor(Math.random() * 100)}`);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return <PopOnUpdateSpan {...args}>{text}</PopOnUpdateSpan>;
};

export const Default = Template.bind({});
Default.args = {};
