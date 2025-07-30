import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import { ContextMenu, ContextMenuSection } from './ContextMenu';

export default {
	title: 'UI/HUD/ContextMenu',
	component: ContextMenu,
} as Meta;

const Template: StoryFn<{ sections: ContextMenuSection[] }> = (args: {
	sections: ContextMenuSection[];
}) => <ContextMenu {...args} />;

export const BasicMenu = Template.bind({});
BasicMenu.args = {
	sections: [
		{
			header: 'File',
			items: [
				{ label: 'New', onClick: () => alert('New File'), children: undefined },
				{ label: 'Open', onClick: () => alert('Open File'), children: undefined },
				{ label: 'Save', onClick: () => alert('Save File'), children: undefined },
			],
		},
		{
			header: 'Edit',
			items: [
				{ label: 'Undo', onClick: () => alert('Undo'), children: undefined },
				{ label: 'Redo', onClick: () => alert('Redo'), children: undefined },
			],
		},
	],
};

export const MenuWithSubmenus = Template.bind({});
MenuWithSubmenus.args = {
	sections: [
		{
			header: 'View',
			items: [
				{ label: 'Zoom In', onClick: () => alert('Zoom In'), children: undefined },
				{ label: 'Zoom Out', onClick: () => alert('Zoom Out'), children: undefined },
				{
					label: 'Themes',
					onClick: undefined,
					children: [
						{
							label: 'Light',
							onClick: () => alert('Light Theme'),
							children: undefined,
						},
						{ label: 'Dark', onClick: () => alert('Dark Theme'), children: undefined },
					],
				},
			],
		},
	],
};

export const TripleNestedMenu = Template.bind({});
TripleNestedMenu.args = {
	sections: [
		{
			header: 'Options',
			items: [
				{
					label: 'Settings',
					onClick: undefined,
					children: [
						{
							label: 'Display',
							onClick: undefined,
							children: [
								{
									label: 'Resolution',
									onClick: () => alert('Resolution Settings'),
									children: undefined,
								},
								{
									label: 'Brightness',
									onClick: () => alert('Brightness Settings'),
									children: undefined,
								},
								{
									label: 'Advanced',
									onClick: undefined,
									children: [
										{
											label: 'Color Depth',
											onClick: () => alert('Color Depth Settings'),
											children: undefined,
										},
										{
											label: 'Refresh Rate',
											onClick: () => alert('Refresh Rate Settings'),
											children: undefined,
										},
									],
								},
							],
						},
					],
				},
			],
		},
	],
};
