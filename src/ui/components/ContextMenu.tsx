import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { activeUiPalette } from '../../constants/palettes';

/**
 * Presentational components
 */
const ContextMenuArrow = styled.div`
	width: 0;
	height: 0;
	border-left: 6px solid transparent;
	border-right: 6px solid transparent;
	border-top: 6px solid ${activeUiPalette.dark};
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
	/* border: 1px solid ${activeUiPalette.dark}; */
	/* border-radius: 3px; */
	overflow: hidden;
`;

// Additional styles apply on <button>
// @see src/ui/GlobalStyles.tsx
export const ContextMenuButton = styled.button`
	display: block;
	width: 100%;
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

export const ContextMenuFooter = styled.div`
	border: none;
	display: block;
	width: 100%;
	box-sizing: border-box;

	// Same as HorizontalLinkListItem
	padding: 0.5em 1em;
	white-space: nowrap;
	transition: background-color 0.5s;
	color: white;
	background-color: ${activeUiPalette.dark};
`;
