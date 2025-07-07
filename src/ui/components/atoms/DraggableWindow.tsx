import React, {
	FunctionComponent,
	HtmlHTMLAttributes,
	ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react';

/**
 * A draggable window component that can be moved by dragging its title bar.
 *
 * @param title - The title text or element to display in the draggable header
 * @param children - The content to display inside the window
 * @param initialPosition - Optional initial position {x, y} for the window
 * @param className - Additional CSS classes to apply to the window
 * @param style - Additional inline styles to apply to the window
 */
export const DraggableWindow: FunctionComponent<
	{
		title: ReactElement | string;
		initialPosition?: { x: number; y: number };
	} & HtmlHTMLAttributes<HTMLElement>
> = ({ title, children, initialPosition, className = '', style = {}, ...rest }) => {
	const [position, setPosition] = useState(initialPosition || { x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const windowRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (!windowRef.current) return;

		const rect = windowRef.current.getBoundingClientRect();
		setDragOffset({
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		});
		setIsDragging(true);
		e.preventDefault();
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) return;

			setPosition({
				x: e.clientX - dragOffset.x,
				y: e.clientY - dragOffset.y,
			});
		},
		[isDragging, dragOffset],
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);

			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [isDragging, handleMouseMove, handleMouseUp]);

	const windowStyle: React.CSSProperties = {
		position: 'absolute',
		left: position.x,
		top: position.y,
		zIndex: isDragging ? 1000 : 1,
		...style,
	};

	return (
		<div
			ref={windowRef}
			className={`draggable-window ${className}`}
			style={windowStyle}
			{...rest}
		>
			<header className='draggable-window-header' onMouseDown={handleMouseDown}>
				{title}
			</header>
			<div className='draggable-window-content'>{children}</div>
		</div>
	);
};
