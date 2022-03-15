import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { useRenderingController } from '../rendering/useRenderingController';
import { EntityI } from '../types';

const CAMERA_POSITION = new Coordinate(-1, 1, 1);

const CAMERA_FOCUS = new Coordinate(0, 0, 0.2);

const RENDERER_OPTIONS = {
	enableAutoRotate: true,
	enablePan: false,
	enableZoom: false,
	fieldOfView: 15,
	pixelRatio: window.devicePixelRatio || 1,
	restrictCameraAngle: false
};

const ActiveEntityPreviewP = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

export const ActiveEntityPreview: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const { onRef } = useRenderingController(
		RENDERER_OPTIONS,
		useCallback(
			controller => {
				controller.setCameraPosition(CAMERA_POSITION);
				const object = entity.createObject();
				const firstMesh = object.children[0] as THREE.Mesh;
				if (firstMesh) {
					controller.setCameraFocusMesh(firstMesh);
				} else {
					controller.setCameraFocus(CAMERA_FOCUS);
				}
				controller.scene.add(object);
				return () => {
					// Leave no trace
					controller.scene.remove(object);
				};
			},
			[entity]
		)
	);
	return <ActiveEntityPreviewP ref={onRef} />;
};
