// const ActiveEntityOverlay: FunctionComponent = ({ children }) => null;

import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback } from 'react';
import { Coordinate } from '../classes/Coordinate';
import Logger from '../classes/Logger';
import { useRenderingController } from '../rendering/useRenderingController';
import { EntityI } from '../types';

const borderColor = `rgba(0,0, 0, 0.5)`;
const ActiveEntityOverlayBoundary = styled.div`
	backdrop-filter: blur(2px);
`;

const ActiveEntityOverlayBody = styled.div`
	border: 1px solid ${borderColor};
	background-color: rgba(0, 0, 0, 0.4);
	padding: 1em;
	display: flex;
	flex-direction: row;
`;
const Avatar = styled.div`
	border: 1px solid ${borderColor};
	border-radius: 50%;
	overflow: hidden;
	width: 64px;
	height: 64px;
	justify-content: center;
	align-items: center;
	display: flex;
	margin-right: 1em;
`;
const HorizontalLinkList = styled.nav`
	display: flex;
	flex-direction: row;
	text-transform: uppercase;
`;
const HorizontalLinkListItem = styled.a`
	flex: 0 0 auto;
	background-color: rgba(255, 255, 255, 0.1);
	margin-right: 3px;

	// Same as ContextMenuItem
	padding: 0.125em 0.5em;
	white-space: nowrap;
	transition: background-color 0.5s;
	color: white;
	/* background-color: transparent; */
	/* background-color: rgba(255, 255, 255, 0.05); */
	&:hover {
		background-color: ${borderColor};
		cursor: pointer;
	}
`;

const EntityTextBadge: FunctionComponent<{ entity: EntityI }> = ({ entity }) => (
	<>
		<p>
			<b>{entity.label}</b>
		</p>
		<p>{entity.title}</p>
		<HorizontalLinkList style={{ marginTop: '1em' }}>
			<HorizontalLinkListItem
				onClick={() => {
					Logger.group('Selected entity');
					Logger.log(entity);
					Logger.groupEnd();
				}}
			>
				LOG
			</HorizontalLinkListItem>
			<HorizontalLinkListItem
				onClick={() => {
					Logger.warn('Following entity not implemented yet', entity);
				}}
			>
				FOLLOW
			</HorizontalLinkListItem>
		</HorizontalLinkList>
	</>
);

const ActiveEntityPreviewP = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

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
const ActiveEntityPreview: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
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

export const ActiveEntityOverlay: FunctionComponent<{ entity?: EntityI; zoom?: number }> = ({
	entity,
	zoom = 4
}) => (
	<ActiveEntityOverlayBoundary>
		<ActiveEntityOverlayBody>
			<Avatar>{entity && <ActiveEntityPreview entity={entity} />}</Avatar>
			<div>{entity ? <EntityTextBadge entity={entity} /> : null}</div>
		</ActiveEntityOverlayBody>
	</ActiveEntityOverlayBoundary>
);
