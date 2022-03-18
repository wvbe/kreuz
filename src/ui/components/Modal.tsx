import React, { useContext, useMemo } from 'react';
import styled from '@emotion/styled';
import { FunctionComponent } from 'react';
import { activeUiPalette } from '../../constants/palettes';
import Draggable from 'react-draggable';
import { Backdrop } from '../../../stories/util';
import { BLURRY_BACKGROUND } from '../../style/mixins';

const ModalWrapper = styled.div`
	position: absolute;
	${BLURRY_BACKGROUND};
`;

const ModalHeader = styled.header`
	background-color: ${activeUiPalette.medium};
	padding: 0.5em 1em;
	&:hover {
		cursor: pointer;
		background-color: ${activeUiPalette.dark};
	}
`;
const ModalBody = styled.div`
	background-color: ${activeUiPalette.light};
	overflow: auto;
	padding: 0.5em 1em;
`;

export const ModalBoundsContext = React.createContext<null | string>(null);

// export const ModalBounds: FunctionComponent<
// 	{ className?: string } & React.DetailedHTMLProps<
// 		React.HTMLAttributes<HTMLDivElement>,
// 		HTMLDivElement
// 	>
// > = ({ children, className = 'modal-boundary-class-name', ...props }) => {
// 	return (
// 		<ModalBoundsContext.Provider value={className}>
// 			<div {...props} className={className}>
// 				{children}
// 			</div>
// 		</ModalBoundsContext.Provider>
// 	);
// };

export const Modal: FunctionComponent<
	{
		initialPosition?: [number, number];
	} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ children, initialPosition, ...rest }) => {
	const bounds = useContext(ModalBoundsContext);
	const defaultPosition = useMemo(
		() => (initialPosition ? { x: initialPosition[0], y: initialPosition[1] } : undefined),
		[initialPosition]
	);
	return (
		<Draggable
			handle="header"
			defaultPosition={defaultPosition}
			bounds={bounds ? `.${bounds}` : undefined}
		>
			<ModalWrapper {...rest}>
				<ModalHeader>Drag me</ModalHeader>
				<ModalBody>
					<div style={{ width: '500px', height: '500px' }}>{children}</div>
				</ModalBody>
			</ModalWrapper>
		</Draggable>
	);
};
