import React, {
	FC,
	MouseEvent,
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';

type ContextMenuControls<Props> = {
	open(event: MouseEvent, props: Props): void;
	close(): void;
};

export function createContextMenu<Props extends {}>(Component: FC<Props>) {
	const _ContextMenuContext = createContext<ContextMenuControls<Props>>({
		open() {},
		close() {},
	});

	/**
	 * Hook
	 */
	function use() {
		return useContext(_ContextMenuContext);
	}

	const Host: FC<PropsWithChildren> = ({ children }) => {
		const [state, setState] = useState<{
			x: number;
			y: number;
			props: Props;
		} | null>(null);

		const open = useCallback<ContextMenuControls<Props>['open']>((event, props) => {
			const offset = {
				x: event.nativeEvent.offsetX,
				y: event.nativeEvent.offsetY,
			};
			let node = event.target as HTMLElement | SVGElement | null;
			while (node) {
				if (node.hasAttribute('data-context-menu-role')) {
					break;
				}
				if (node instanceof HTMLElement) {
					// Assume that the clicked element is centered on its anchor position by
					// using CSS transform: translate(-50%, -50%)
					const boundingBox = node.getBoundingClientRect();
					offset.x += (node as HTMLElement).offsetLeft - boundingBox.width / 2;
					offset.y += (node as HTMLElement).offsetTop - boundingBox.height / 2;
				} else if (node instanceof SVGElement) {
					const style = window.getComputedStyle(node);
					if (style.left !== 'auto') {
						offset.x += parseInt(style.left);
					}
					if (style.top !== 'auto') {
						offset.y += parseInt(style.top);
					}
				}

				node = node.parentElement;
			}
			setState({
				x: offset.x,
				y: offset.y,
				props,
			});
			event.preventDefault();
			event.stopPropagation();
		}, []);

		const close = useCallback(() => {
			setState(null);
		}, []);

		const value = useMemo(
			() => ({
				open,
				close,
			}),
			[open, close],
		);

		return (
			<_ContextMenuContext.Provider value={value}>
				{children}
				{state && (
					<div
						className="context-menu"
						style={{
							top: state.y,
							left: state.x,
						}}
					>
						{React.createElement<Props>(Component, state.props)}
					</div>
				)}
			</_ContextMenuContext.Provider>
		);
	};

	return { use, Host };
}
