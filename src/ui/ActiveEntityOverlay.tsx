// const ActiveEntityOverlay: FunctionComponent = ({ children }) => null;

import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import Logger from '../classes/Logger';
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
		<p>{entity.job?.label || 'Jobless'}</p>
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

export const ActiveEntityOverlay: FunctionComponent<{ entity?: EntityI; zoom?: number }> = ({
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
