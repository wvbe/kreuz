import { FC, useCallback } from 'react';
import { useModalStore } from '../stores/modalStore';

export interface ModalConfig<T = any> {
	/** The title of the modal */
	title: string;
	/** Initial position of the modal */
	position?: { x: number; y: number };
	/** Whether the modal can be minimized */
	minimizable?: boolean;
	/** Whether the modal can be closed */
	closeable?: boolean;
	/** Initial minimized state */
	initialMinimized?: boolean;
	/** Additional props to pass to the modal content component */
	props?: T;
}

/**
 * Hook that provides a function to open modals with a specific component and configuration
 * @template TProps - The props type of the component
 * @template TComponent - The type of the component to render in the modal
 * @param Component - The component to render in the modal
 * @returns A function that opens a modal with the given component and configuration
 */
export function useModalOpener<TComponent extends FC<any>>(Component: TComponent) {
	const openModal = useModalStore((state) => state.openModal);

	return useCallback(
		(config: ModalConfig<TComponent extends FC<infer TProps> ? TProps : never>) => {
			const { title, position, minimizable, closeable, initialMinimized, props } = config;
			return openModal({
				component: Component,
				props: {
					title,
					...props,
				},
				position,
				minimized: initialMinimized,
			});
		},
		[Component, openModal],
	);
}

/**
 * Example usage:
 *
 * ```tsx
 * interface MyModalProps {
 *   data: string;
 *   onSubmit: () => void;
 * }
 *
 * const MyModal: React.FC<MyModalProps> = ({ data, onSubmit }) => {
 *   return (
 *     <div>
 *       <p>{data}</p>
 *       <button onClick={onSubmit}>Submit</button>
 *     </div>
 *   );
 * };
 *
 * const MyComponent = () => {
 *   const openMyModal = useModalOpener(MyModal);
 *
 *   const handleOpenModal = () => {
 *     openMyModal({
 *       title: "My Modal",
 *       props: {
 *         data: "Some data",
 *         onSubmit: () => console.log("Submitted!"),
 *       },
 *     });
 *   };
 *
 *   return <button onClick={handleOpenModal}>Open Modal</button>;
 * };
 * ```
 */
