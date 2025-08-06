import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Panel } from './Panel';
import styles from './Popover.module.css';

interface PopoverProps {
	/**
	 * Function that receives a trigger function to show the popover
	 */
	renderPopoverAnchor: (controls: {
		open: () => void;
		close: () => void;
		isOpen: boolean;
	}) => ReactNode;
	/**
	 * Function that returns the content to display in the popover
	 */
	renderPopoverContents: () => ReactNode;
	/**
	 * Whether the popover should be shown by default
	 */
	defaultOpen?: boolean;
	/**
	 * Whether clicking outside the popover should close it
	 */
	closeOnOutsideClick?: boolean;
	/**
	 * Whether pressing Escape should close the popover
	 */
	closeOnEscape?: boolean;
	/**
	 * Custom CSS class name for the popover container
	 */
	className?: string;
}

/**
 * A popover component that displays content adjacent to an anchor element.
 *
 * The component takes two render functions:
 * - `renderPopoverAnchor`: Receives a function to trigger the popover
 * - `renderPopoverContents`: Returns the content to display in the popover
 *
 * The popover will position itself relative to the anchor element and can be
 * closed by clicking outside or pressing Escape (if enabled).
 */
export const Popover: FC<PopoverProps> = ({
	renderPopoverAnchor,
	renderPopoverContents,
	defaultOpen = false,
	closeOnOutsideClick = true,
	closeOnEscape = true,
	className = '',
}) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const anchorRef = useRef<HTMLDivElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);

	const showPopover = useCallback(() => {
		setIsOpen(true);
	}, []);

	const hidePopover = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Calculate position when popover opens
	useEffect(() => {
		if (!isOpen || !anchorRef.current || !popoverRef.current) {
			return;
		}

		const anchorRect = anchorRef.current.getBoundingClientRect();
		const popoverRect = popoverRef.current.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Default position: above and aligned to the left of the anchor
		let top = anchorRect.top - popoverRect.height - 8;
		let left = anchorRect.left;

		// Adjust if popover would go off the right edge
		if (left + popoverRect.width > viewportWidth) {
			left = Math.max(0, viewportWidth - popoverRect.width - 8);
		}

		// If popover would go off the top, position it below the anchor
		if (top < 0) {
			top = anchorRect.bottom + 8;
		}

		// Ensure popover doesn't go off the bottom
		if (top + popoverRect.height > viewportHeight) {
			top = Math.max(0, viewportHeight - popoverRect.height - 8);
		}
	}, [isOpen]);

	// Handle outside clicks
	useEffect(() => {
		if (!isOpen || !closeOnOutsideClick) {
			return;
		}

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			if (
				anchorRef.current &&
				!anchorRef.current.contains(target) &&
				popoverRef.current &&
				!popoverRef.current.contains(target)
			) {
				hidePopover();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, closeOnOutsideClick, hidePopover]);

	// Handle Escape key
	useEffect(() => {
		if (!isOpen || !closeOnEscape) {
			return;
		}

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				hidePopover();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, closeOnEscape, hidePopover]);

	return (
		<div className={`${styles['popover-container']} ${className}`}>
			<div ref={anchorRef} className={styles['popover-anchor']}>
				{renderPopoverAnchor({
					open: showPopover,
					close: hidePopover,
					isOpen,
				})}
			</div>
			{isOpen && (
				<Panel
					ref={popoverRef}
					className={styles.popover}
					style={{
						position: 'absolute',
						bottom: 'calc(100% + 8px)',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 1000,
					}}
				>
					{renderPopoverContents()}
				</Panel>
			)}
		</div>
	);
};
