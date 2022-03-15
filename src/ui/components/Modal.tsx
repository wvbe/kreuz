import React from 'react';
import styled from '@emotion/styled';
import { FunctionComponent } from 'react';

const ModalBoundary = styled.div`
	position: absolute;
	bottom: 100%;
	left: 50%;
	backdrop-filter: blur(2px);
	transform: translate(-50%, -6px);
`;

const ModalBody = styled.div`
	overflow: hidden;
`;

export const Modal: FunctionComponent = ({ children }) => {
	return (
		<ModalBoundary>
			<ModalBody></ModalBody>
		</ModalBoundary>
	);
};
