import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta = {
	title: 'HUD/Atoms/Modal',
	component: Modal,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'Example Modal',
		children: (
			<div>
				<h3>Modal Content</h3>
				<p>This is an example modal with some content.</p>
				<p>Try dragging this modal by its title bar!</p>
			</div>
		),
	},
};

export const NonCloseable: Story = {
	args: {
		...Default.args,
		closeable: false,
	},
};

export const NonMinimizable: Story = {
	args: {
		...Default.args,
		minimizable: false,
	},
};

export const InitiallyMinimized: Story = {
	args: {
		...Default.args,
		initialMinimized: true,
	},
};

export const CustomPosition: Story = {
	args: {
		...Default.args,
		initialPosition: { x: 100, y: 100 },
	},
};

export const MultipleModals: Story = {
	render: () => (
		<>
			<Modal title='First Modal' initialPosition={{ x: 50, y: 50 }}>
				<p>This is the first modal. Try dragging it!</p>
			</Modal>
			<Modal title='Second Modal' initialPosition={{ x: 300, y: 100 }}>
				<p>This is another modal. You can drag this one too!</p>
			</Modal>
		</>
	),
};
