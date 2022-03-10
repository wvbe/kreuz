import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';

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

export const ContextMenu: FunctionComponent = ({ children }) => {
	return (
		<>
			<ContextMenuBoundary>
				<ContextMenuBody>{children}</ContextMenuBody>
			</ContextMenuBoundary>
			<ContextMenuArrow />
		</>
	);
};

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
