import styled from '@emotion/styled';
import React, {
	createContext,
	FunctionComponent,
	ReactElement,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react';
import { CoordinateLike } from '../classes/Coordinate';
import { ViewportHtmlContainer } from '../space/Viewport';
import { Event } from '../util/events';

const CONTEXT = createContext<null | ContextMenuManager>(null);

/**
 * Presentational components
 */

const ContextMenuArrow = styled.div`
	width: 0;
	height: 0;
	border-left: 6px solid transparent;
	border-right: 6px solid transparent;
	border-top: 6px solid rgba(255, 255, 255, 0.5);
	transform: translate(calc(-50% + 0px), -6px);
`;

const ContextMenuBoundary = styled.div`
	position: absolute;
	bottom: 100%;
	left: 50%;
	backdrop-filter: blur(2px);
	transform: translate(-50%, -6px);
`;

const ContextMenuBody = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.5);
	border-radius: 3px;
`;

export const ContextMenuButton = styled.button`
	border: none;
	display: block;
	width: 100%;
	box-sizing: border-box;
	padding: 0.5em 1em;
	white-space: nowrap;
	transition: background-color 0.5s;
	color: white;
	background-color: transparent;
	/* background-color: rgba(255, 255, 255, 0.05); */
	&:hover {
		background-color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
`;

/**
 * Logic
 */
type ContextManagerState = false | { location: CoordinateLike; contents: ReactElement };
class ContextMenuManager {
	public state: ContextManagerState = false;
	public change = new Event<[ContextManagerState]>();

	invoke(location: CoordinateLike, contents: ReactElement) {
		this.state = { location, contents };
		this.change.emit(this.state);
	}

	isOpen() {
		return !!this.state;
	}

	close() {
		this.state = false;
		this.change.emit(this.state);
	}
}

// const manager = new ContextMenuManager();
export const ContextMenuProvider: FunctionComponent = ({ children }) => {
	const manager = useMemo(() => new ContextMenuManager(), []);
	return <CONTEXT.Provider value={manager}>{children}</CONTEXT.Provider>;
};

export const useContextMenuManager = () => {
	const contextMenuManager = useContext(CONTEXT);
	return contextMenuManager;
};

export const ContextMenuContainer: FunctionComponent<{ zoom: number }> = ({ zoom = 1 }) => {
	const contextMenuManager = useContextMenuManager();
	const [managerState, setManagerState] = useState(contextMenuManager?.state);
	useEffect(() => {
		if (!contextMenuManager) {
			throw new Error('Shit.');
		}
		return contextMenuManager.change.on(setManagerState);
	}, [contextMenuManager]);

	if (!managerState) {
		return null;
	}
	return (
		<ViewportHtmlContainer location={managerState.location} width={0} height={0} zoom={zoom}>
			<ContextMenuBoundary>
				<ContextMenuBody>{managerState.contents}</ContextMenuBody>
			</ContextMenuBoundary>
			<ContextMenuArrow />
		</ViewportHtmlContainer>
	);
};
