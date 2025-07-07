import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './Button';
import { Popover } from './Popover';

/**
 * Popover component for displaying contextual information.
 *
 * The component takes two render functions:
 * - `renderPopoverAnchor`: Receives an object with open, close, and isOpen functions/properties
 * - `renderPopoverContents`: Returns the content to display in the popover
 *
 * Features:
 * - Automatic positioning relative to anchor
 * - Click outside to close
 * - Escape key to close
 * - Responsive design with viewport awareness
 */
const meta: Meta<typeof Popover> = {
	title: 'HUD/Atoms/Popover',
	component: Popover,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		defaultOpen: {
			control: 'boolean',
			description: 'Whether the popover should be shown by default',
		},
		closeOnOutsideClick: {
			control: 'boolean',
			description: 'Whether clicking outside the popover should close it',
		},
		closeOnEscape: {
			control: 'boolean',
			description: 'Whether pressing Escape should close the popover',
		},
		className: {
			control: 'text',
			description: 'Custom CSS class name for the popover container',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic popover with button trigger
 */
export const Basic: Story = {
	render: (args) => (
		<Popover
			{...args}
			renderPopoverAnchor={({ open }) => (
				<Button onClick={open}>Click to show popover</Button>
			)}
			renderPopoverContents={() => (
				<div>
					<h3>Popover Content</h3>
					<p>This is some content in the popover.</p>
					<p>You can put any React components here.</p>
				</div>
			)}
		/>
	),
};

/**
 * Popover with rich content including icons and formatting
 */
export const RichContent: Story = {
	render: (args) => (
		<Popover
			{...args}
			renderPopoverAnchor={({ open }) => (
				<Button onClick={open} icon='ℹ️' iconSide='before'>
					Information
				</Button>
			)}
			renderPopoverContents={() => (
				<div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							marginBottom: '8px',
						}}
					>
						<span style={{ fontSize: '1.2em' }}>ℹ️</span>
						<h3 style={{ margin: 0 }}>Important Information</h3>
					</div>
					<p style={{ margin: '8px 0' }}>
						This popover contains rich content with icons, formatting, and multiple
						elements.
					</p>
					<div
						style={{
							background: '#f0f0f0',
							padding: '8px',
							borderRadius: '4px',
							fontSize: '0.9em',
							marginTop: '8px',
						}}
					>
						<strong>Note:</strong> This is a styled information box.
					</div>
				</div>
			)}
		/>
	),
};

/**
 * Popover with form elements
 */
export const WithForm: Story = {
	render: (args) => (
		<Popover
			{...args}
			renderPopoverAnchor={({ open }) => (
				<Button onClick={open} icon='⚙️' iconSide='before'>
					Settings
				</Button>
			)}
			renderPopoverContents={() => (
				<div>
					<h3 style={{ margin: '0 0 12px 0' }}>Quick Settings</h3>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<input type='checkbox' defaultChecked />
							Enable notifications
						</label>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<input type='checkbox' />
							Auto-save
						</label>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<input type='checkbox' defaultChecked />
							Dark mode
						</label>
					</div>
					<div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
						<Button layout='tile'>Save</Button>
						<Button layout='tile'>Cancel</Button>
					</div>
				</div>
			)}
		/>
	),
};

/**
 * Popover with list content
 */
export const WithList: Story = {
	render: (args) => (
		<Popover
			{...args}
			renderPopoverAnchor={({ open }) => (
				<Button onClick={open} icon='📋' iconSide='before'>
					Recent Items
				</Button>
			)}
			renderPopoverContents={() => (
				<div>
					<h3 style={{ margin: '0 0 8px 0' }}>Recent Items</h3>
					<ul
						style={{
							margin: 0,
							padding: 0,
							listStyle: 'none',
							display: 'flex',
							flexDirection: 'column',
							gap: '4px',
						}}
					>
						<li
							style={{
								padding: '4px 8px',
								borderRadius: '4px',
								background: '#f8f8f8',
								cursor: 'pointer',
							}}
						>
							📄 Document 1
						</li>
						<li
							style={{
								padding: '4px 8px',
								borderRadius: '4px',
								background: '#f8f8f8',
								cursor: 'pointer',
							}}
						>
							📄 Document 2
						</li>
						<li
							style={{
								padding: '4px 8px',
								borderRadius: '4px',
								background: '#f8f8f8',
								cursor: 'pointer',
							}}
						>
							📄 Document 3
						</li>
					</ul>
				</div>
			)}
		/>
	),
};

/**
 * Popover that starts open by default
 */
export const DefaultOpen: Story = {
	render: (args) => (
		<Popover
			{...args}
			defaultOpen={true}
			renderPopoverAnchor={({ open }) => <Button onClick={open}>Default Open Popover</Button>}
			renderPopoverContents={() => (
				<div>
					<h3>Default Open</h3>
					<p>This popover starts in an open state.</p>
				</div>
			)}
		/>
	),
};

/**
 * Popover with disabled outside click closing
 */
export const NoOutsideClick: Story = {
	render: (args) => (
		<Popover
			{...args}
			closeOnOutsideClick={false}
			renderPopoverAnchor={({ open }) => <Button onClick={open}>Sticky Popover</Button>}
			renderPopoverContents={() => (
				<div>
					<h3>Sticky Popover</h3>
					<p>This popover won't close when you click outside.</p>
					<p>You'll need to use the Escape key or click the button again.</p>
				</div>
			)}
		/>
	),
};

/**
 * Multiple popovers for comparison
 */
export const MultiplePopovers: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
			<Popover
				renderPopoverAnchor={({ open }) => (
					<Button onClick={open} layout='tile'>
						Info
					</Button>
				)}
				renderPopoverContents={() => (
					<div>
						<h3>Information</h3>
						<p>This is an informational popover.</p>
					</div>
				)}
			/>

			<Popover
				renderPopoverAnchor={({ open }) => (
					<Button onClick={open} layout='tile'>
						Warning
					</Button>
				)}
				renderPopoverContents={() => (
					<div>
						<h3>⚠️ Warning</h3>
						<p>This is a warning popover.</p>
					</div>
				)}
			/>

			<Popover
				renderPopoverAnchor={({ open }) => (
					<Button onClick={open} layout='tile'>
						Help
					</Button>
				)}
				renderPopoverContents={() => (
					<div>
						<h3>❓ Help</h3>
						<p>This is a help popover.</p>
					</div>
				)}
			/>
		</div>
	),
};

/**
 * Popover with long content that demonstrates text wrapping
 */
export const LongContent: Story = {
	render: (args) => (
		<Popover
			{...args}
			renderPopoverAnchor={({ open }) => <Button onClick={open}>Show Long Content</Button>}
			renderPopoverContents={() => (
				<div>
					<h3>Long Content Example</h3>
					<p>
						This popover contains a very long paragraph that demonstrates how the text
						wraps within the popover container. The content should automatically wrap to
						fit within the maximum width constraints while maintaining readability.
					</p>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
						tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
						quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
						consequat.
					</p>
					<div
						style={{
							background: '#f0f0f0',
							padding: '8px',
							borderRadius: '4px',
							marginTop: '8px',
						}}
					>
						<strong>Summary:</strong> This demonstrates text wrapping and content
						overflow handling.
					</div>
				</div>
			)}
		/>
	),
};
