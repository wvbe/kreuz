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
	enableAutoRotate: true,
	enablePan: false,
	enableZoom: true,
	fieldOfView: 45,
	pixelRatio: window.devicePixelRatio || 1,
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
