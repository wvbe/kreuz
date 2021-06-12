// const ActiveEntityOverlay: FunctionComponent = ({ children }) => null;

import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { Entity } from '../entities/Entity';

const ActiveEntityOverlayBoundary = styled.div`
	position: absolute;
	bottom: 2em;
	left: 2em;
	backdrop-filter: blur(2px);
`;

const ActiveEntityOverlayBody = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.5);
	border-radius: 3px;
	padding: 1em;

	font-family: sans-serif;
	color: white;
	display: flex;
	flex-direction: row;
`;
const Avatar = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.5);
	border-radius: 50%;
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
	font-size: 60%;
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
		background-color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
	}
`;
export const EntityTextBadge: FunctionComponent<{ entity: Entity }> = ({ entity }) => (
	<>
		<p>
			<b>{entity.label}</b>
		</p>
		<p>{entity?.job ? entity.job.label : 'Jobless'}</p>
		<HorizontalLinkList style={{ marginTop: '1em' }}>
			<HorizontalLinkListItem
				onClick={() => {
					console.log('Active entity:', entity);
				}}
			>
				LOG
			</HorizontalLinkListItem>
			<HorizontalLinkListItem
				onClick={() => {
					console.warn('Following entity not implemented yet', entity);
				}}
			>
				FOLLOW
			</HorizontalLinkListItem>
		</HorizontalLinkList>
	</>
);
export const ActiveEntityOverlay: FunctionComponent<{ entity?: Entity; zoom?: number }> = ({
	entity,
	zoom = 4
}) => (
	<ActiveEntityOverlayBoundary>
		<ActiveEntityOverlayBody>
			<Avatar>
				{entity && (
					<svg
						width="1"
						height="1"
						overflow="visible"
						shapeRendering="geometricPrecision"
						viewBox={[0, 0, 1 / zoom, 1 / zoom].join(' ')}
					>
						<entity.Component />
					</svg>
				)}
			</Avatar>
			<div>{entity ? <EntityTextBadge entity={entity} /> : null}</div>
		</ActiveEntityOverlayBody>
	</ActiveEntityOverlayBoundary>
);
