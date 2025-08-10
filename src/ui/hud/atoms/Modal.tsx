import { useEffect, useRef, useState } from 'react';
import styles from './Modal.module.css';
import { Panel } from './Panel';

export interface ModalProps {
	/** The title displayed in the modal's header */
	title: string;
	/** The content to display in the modal */
	children: React.ReactNode;
	/** Initial position of the modal */
	initialPosition?: { x: number; y: number };
	/** Called when the modal is closed */
	onClose?: () => void;
	/** Called when the modal is minimized/maximized */
	onMinimize?: (minimized: boolean) => void;
	/** Whether the modal can be minimized */
	minimizable?: boolean;
	/** Whether the modal can be closed */
	closeable?: boolean;
	/** Initial minimized state */
	initialMinimized?: boolean;
}

/**
 * A draggable modal component that can be minimized and closed
 */
export const Modal: React.FC<ModalProps> = ({
	title,
	children,
	initialPosition = { x: 20, y: 20 },
	onClose,
	onMinimize,
	minimizable = true,
	closeable = true,
	initialMinimized = false,
}) => {
	const [position, setPosition] = useState(initialPosition);
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isMinimized, setIsMinimized] = useState(initialMinimized);
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging || !modalRef.current) return;

			const modalRect = modalRef.current.getBoundingClientRect();
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;

			// Calculate new position
			const newX = e.clientX - dragOffset.x;
			const newY = e.clientY - dragOffset.y;

			// Keep modal within viewport bounds
			const boundedX = Math.max(0, Math.min(newX, viewportWidth - modalRect.width));
			const boundedY = Math.max(0, Math.min(newY, viewportHeight - modalRect.height));

			setPosition({
				x: boundedX,
				y: boundedY,
			});
		};

		const handleMouseUp = () => {
			setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, dragOffset]);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!modalRef.current) return;

		// Calculate offset from current mouse position to current modal position
		setDragOffset({
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		});
		setIsDragging(true);

		// Prevent text selection during drag
		e.preventDefault();
	};

	const handleMinimize = () => {
		const newMinimized = !isMinimized;
		setIsMinimized(newMinimized);
		onMinimize?.(newMinimized);
	};

	return (
		<div
			ref={modalRef}
			className={`${styles.modal} ${isMinimized ? styles.minimized : ''}`}
			style={{
				zIndex: 1,
				left: `${position.x}px`,
				top: `${position.y}px`,
			}}
		>
			<Panel>
				<div className={styles.titleBar} onMouseDown={handleMouseDown}>
					<h2 className={styles.title}>{title}</h2>
					<div className={styles.controls}>
						{minimizable && (
							<button
								className={styles.control}
								onClick={handleMinimize}
								title={isMinimized ? 'Maximize' : 'Minimize'}
							>
								{isMinimized ? '□' : '_'}
							</button>
						)}
						{closeable && (
							<button className={styles.control} onClick={onClose} title='Close'>
								×
							</button>
						)}
					</div>
				</div>
				<div className={styles.content}>{children}</div>
			</Panel>
		</div>
	);
};
