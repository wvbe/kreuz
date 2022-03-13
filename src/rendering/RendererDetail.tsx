import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { ThreeController } from './threejs/ThreeController';
import { useRenderingController } from './useRenderingController';

const AsLargeAsPossibleContainer = styled.section`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

const RENDERER_OPTIONS = {
	fieldOfView: 45,
	enableAutoRotate: true,
	enablePan: false,
	enableZoom: true,
	restrictCameraAngle: false
};
export const RendererDetail: FunctionComponent<{
	build: (controller: ThreeController) => () => void;
}> = ({ build }) => {
	const { onRef } = useRenderingController(RENDERER_OPTIONS, build);

	return (
		<AsLargeAsPossibleContainer
			className="renderer-detail"
			ref={onRef}
		></AsLargeAsPossibleContainer>
	);
};
