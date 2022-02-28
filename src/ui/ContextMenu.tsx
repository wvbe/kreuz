import styled from '@emotion/styled';
import React, { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import { CoordinateI } from '../classes/Coordinate';
import { useGame } from '../hooks/game';
import { ViewportHtmlContainer } from '../space/Viewport';
import { Event } from '../classes/Event';

/**
 * Presentational components
 */
const borderColor = `rgba(0,0, 0, 0.5)`;
const ContextMenuArrow = styled.div`
	width: 0;
	height: 0;
	border-left: 6px solid transparent;
	border-right: 6px solid transparent;
	border-top: 6px solid ${borderColor};
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
	border: 1px solid ${borderColor};
	background-color: rgba(0, 0, 0, 0.4);
	border-radius: 3px;
	overflow: hidden;
`;

export const ContextMenuButton = styled.button`
	border: none;
	display: block;
	width: 100%;
	box-sizing: border-box;

	// Same as HorizontalLinkListItem
	padding: 0.5em 1em;
	white-space: nowrap;
	transition: background-color 0.5s;
	color: white;
	background-color: transparent;
	&:hover {
		background-color: ${borderColor};
		cursor: pointer;
	}
`;

export const ContextMenuFooter = styled.button`
	border: none;
	display: block;
	width: 100%;
	box-sizing: border-box;

	// Same as HorizontalLinkListItem
	padding: 0.5em 1em;
	white-space: nowrap;
	transition: background-color 0.5s;
	color: white;
	background-color: ${borderColor};
`;

/**
 * Logic
 */
type ContextManagerState = false | { location: CoordinateI; contents: ReactElement };
export class ContextMenuManager {
	public state: ContextManagerState = false;
	public $changed = new Event<[ContextManagerState]>();

	open(location: CoordinateI, contents: ReactElement) {
		this.state = { location, contents };
		this.$changed.emit(this.state);
	}

	isOpen() {
		return !!this.state;
	}

	close() {
		this.state = false;
		this.$changed.emit(this.state);
	}
}

export const ContextMenuContainer: FunctionComponent<{ zoom?: number }> = ({ zoom = 1 }) => {
	const { contextMenu } = useGame();
	const [managerState, setManagerState] = useState(contextMenu?.state);
	useEffect(() => {
		if (!contextMenu) {
			throw new Error('Shit.');
		}
		return contextMenu.$changed.on(setManagerState);
	}, [contextMenu]);

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
