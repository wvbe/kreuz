import React from 'react';
import styled from '@emotion/styled';
import { FunctionComponent } from 'react';
import { activeUiPalette } from '../../constants/palettes';

const ModalBoundary = styled.div`
	position: absolute;
	backdrop-filter: blur(2px);
	display: flex;
`;

const ModalBody = styled.div`
	background-color: ${activeUiPalette.medium};
	overflow: auto;
`;

export const Modal: FunctionComponent<
	React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ children, ...rest }) => {
	return (
		<ModalBoundary {...rest}>
			<ModalBody>{children}</ModalBody>
		</ModalBoundary>
	);
};
