import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { useModalOpener } from '../../hooks/useModalOpener';
import { ModalHost } from './ModalHost';

const meta = {
	title: 'HUD/Atoms/ModalHost',
	component: ModalHost,
	parameters: {
		layout: 'fullscreen',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof ModalHost>;

export default meta;
type Story = StoryObj<typeof meta>;

interface ExampleModalProps {
	message: string;
	onAction?: () => void;
}

const ExampleModal: React.FC<ExampleModalProps> = ({ message, onAction }) => {
	return (
		<div style={{ padding: '20px' }}>
			<p>{message}</p>
			{onAction && (
				<button onClick={onAction} style={{ marginTop: '10px' }}>
					Open Another Modal
				</button>
			)}
		</div>
	);
};

const ModalDemo = () => {
	const openExampleModal = useModalOpener(ExampleModal);

	const handleOpenModal = useCallback(() => {
		openExampleModal({
			title: 'First Modal',
			props: {
				message: 'This is the first modal!',
				onAction: () => {
					openExampleModal({
						title: 'Second Modal',
						position: { x: 300, y: 100 },
						props: {
							message: 'This is another modal that was opened from the first one!',
						},
					});
				},
			},
		});
	}, [openExampleModal]);

	return (
		<div style={{ padding: '20px' }}>
			<button onClick={handleOpenModal}>Open Modal</button>
			<ModalHost />
		</div>
	);
};

export const Default: Story = {
	render: () => <ModalDemo />,
};
