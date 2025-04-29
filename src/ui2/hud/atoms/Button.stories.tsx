import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * Button component for user interactions.
 *
 * Supports two layout modes:
 * - `default`: Standard button with rounded corners
 * - `tile`: Square tile-style button for grid layouts
 */
const meta: Meta<typeof Button> = {
	title: 'HUD/Atoms/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		onClick: { action: 'clicked' },
		disabled: {
			control: 'boolean',
			description: 'Whether the button is disabled',
		},
		layout: {
			control: 'select',
			options: ['default', 'tile'],
			description: 'Button layout style',
		},
		children: {
			control: 'text',
			description: 'Button content',
		},
		icon: {
			control: 'text',
			description: 'Icon content (string or React node)',
		},
		iconSide: {
			control: 'select',
			options: ['before', 'after'],
			description: 'Which side of the text to place the icon',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default button with standard styling
 */
export const Default: Story = {
	args: {
		children: 'Click me',
	},
};

/**
 * Button in tile layout mode, suitable for grid-based interfaces
 */
export const Tile: Story = {
	args: {
		children: 'Tile',
		layout: 'tile',
	},
};

/**
 * Disabled button state
 */
export const Disabled: Story = {
	args: {
		children: 'Disabled',
		disabled: true,
	},
};

/**
 * Disabled tile button
 */
export const DisabledTile: Story = {
	args: {
		children: 'Disabled',
		layout: 'tile',
		disabled: true,
	},
};

/**
 * Button with longer text content
 */
export const LongText: Story = {
	args: {
		children: 'This is a button with longer text content',
	},
};

/**
 * Tile button with longer text
 */
export const TileLongText: Story = {
	args: {
		children: 'Long text in tile',
		layout: 'tile',
	},
};

/**
 * Button with icon-like content
 */
export const IconButton: Story = {
	args: {
		children: '⚡',
		layout: 'tile',
	},
};

/**
 * Button with icon before text
 */
export const IconBefore: Story = {
	args: {
		children: 'Save',
		icon: '💾',
		iconSide: 'before',
	},
};

/**
 * Button with icon after text
 */
export const IconAfter: Story = {
	args: {
		children: 'Download',
		icon: '⬇️',
		iconSide: 'after',
	},
};

/**
 * Tile button with icon
 */
export const TileWithIcon: Story = {
	args: {
		children: 'Build',
		icon: '🔨',
		layout: 'tile',
	},
};

/**
 * Button with React node as icon
 */
export const ReactNodeIcon: Story = {
	args: {
		children: 'Settings',
		icon: <span style={{ fontSize: '1.2em' }}>⚙️</span>,
		iconSide: 'after',
	},
};

/**
 * Multiple buttons in different states for comparison
 */
export const AllStates: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
			<Button>Default</Button>
			<Button disabled>Disabled</Button>
			<Button layout='tile'>Tile</Button>
			<Button layout='tile' disabled>
				Disabled Tile
			</Button>
		</div>
	),
};

/**
 * Multiple buttons with icons for comparison
 */
export const IconExamples: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
			<Button icon='💾' iconSide='before'>
				Save
			</Button>
			<Button icon='⬇️' iconSide='after'>
				Download
			</Button>
			<Button icon='🔨' layout='tile'>
				Build
			</Button>
			<Button icon='⚙️' iconSide='after'>
				Settings
			</Button>
		</div>
	),
};
