import { Meta, StoryFn } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { PopOnUpdateSpan } from './PopOnUpdateSpan';

export default {
	title: 'UI/Util/PopOnUpdateSpan',
	component: PopOnUpdateSpan,
} as Meta;

const Template: StoryFn = (args) => {
	const [text, setText] = useState('This will refresh for a random value every 2 seconds');

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
