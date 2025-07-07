import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { DraggableWindow } from './DraggableWindow';
import './DraggableWindow.css';

export default {
	title: 'UI/Atoms/DraggableWindow',
	component: DraggableWindow,
	parameters: {
		layout: 'padded',
	},
} as Meta;

const Template: StoryFn = (args: any) => (
	<div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
		<DraggableWindow {...args} />
	</div>
);

export const Default = Template.bind({});
Default.args = {
	title: 'Draggable Window',
	children: (
		<div>
			<p>This is a draggable window. You can drag it by the title bar.</p>
			<p>The window can be positioned anywhere on the screen.</p>
		</div>
	),
};

export const WithInitialPosition = Template.bind({});
WithInitialPosition.args = {
	title: 'Positioned Window',
	initialPosition: { x: 100, y: 100 },
	children: (
		<div>
			<p>This window starts at position (100, 100).</p>
			<p>You can still drag it to move it around.</p>
		</div>
	),
};

export const WithComplexTitle = Template.bind({});
WithComplexTitle.args = {
	title: (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<span>📁</span>
			<span>File Explorer</span>
			<span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.7 }}>Modified</span>
		</div>
	),
	children: (
		<div>
			<p>This window has a complex title with icons and additional information.</p>
			<p>The entire title bar is draggable.</p>
		</div>
	),
};

export const LargeContent = Template.bind({});
LargeContent.args = {
	title: 'Large Content Window',
	children: (
		<div>
			<p>This window contains a lot of content to demonstrate scrolling.</p>
			{Array.from({ length: 20 }, (_, i) => (
				<p key={i}>
					Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</p>
			))}
		</div>
	),
};
