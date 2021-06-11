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

export const ActiveEntityOverlay: FunctionComponent<{ entity?: Entity }> = ({ entity }) => (
	<ActiveEntityOverlayBoundary>
		<ActiveEntityOverlayBody>
			<Avatar>
				<p>T</p>
			</Avatar>
			<div>
				<p>Heyyoo</p>
				{entity ? (
					<p>
						<b>{entity.label}</b>
					</p>
				) : (
					<p>Not anything selected</p>
				)}
				{entity?.job ? <p>{entity.job.label}</p> : <p>Jobless</p>}
			</div>
		</ActiveEntityOverlayBody>
	</ActiveEntityOverlayBoundary>
);
