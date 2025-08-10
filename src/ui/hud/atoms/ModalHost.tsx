import React from 'react';
import { useModalStore } from '../../stores/modalStore';
import { Modal } from './Modal';

/**
 * Component that renders and manages all active modals in the application
 */
export const ModalHost: React.FC = () => {
	const { modals, closeModal, updateModal } = useModalStore();

	return (
		<>
			{modals.map((modal) => {
				const { id, component: Component, props, position, minimized } = modal;
				return (
					<Modal
						key={id}
						title={props.title || 'Modal'}
						initialPosition={position}
						initialMinimized={minimized}
						onClose={() => closeModal(id)}
						onMinimize={(minimized) => updateModal(id, { minimized })}
					>
						<Component {...props} />
					</Modal>
				);
			})}
		</>
	);
};
