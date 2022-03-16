// const ActiveEntityOverlay: FunctionComponent = ({ children }) => null;

import styled from '@emotion/styled';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Logger from '../classes/Logger';
import { activeUiPalette } from '../constants/palettes';
import { useGame } from '../hooks/game';
import { EntityI } from '../types';
import { ActiveEntityPreview } from './ActiveEntityPreview';
import { Button } from './components/Button';

const borderColor = activeUiPalette.darkest;

const LocalBoundary = styled.div`
	backdrop-filter: blur(2px);
	border-bottom: 3px solid ${activeUiPalette.darkest};
`;

const LocalBody = styled.div`
	background-color: ${activeUiPalette.medium};
	padding: 1em;
	display: flex;
	flex-direction: row;
`;

const HorizontalLinkList = styled.nav`
	& > * {
		margin-left: 1em;
	}

	/*
		The pseudo class ":first-child" is potentially unsafe when doing server-side rendering.
		Try changing it to ":first-of-type"
	 */
	& > :first-of-type {
		margin-left: 0;
	}
`;

export const EntityTextBadge: FunctionComponent<{ entity: EntityI }> = ({ entity }) => (
	<>
		<p>
			<b>{entity.label}</b>
		</p>
		<p>{entity.title}</p>
	</>
);

const EntityOptions: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const game = useGame();
	const [unfollow, setUnfollow] = useState<{ fn: () => void } | null>(null);
	useEffect(() => {
		if (unfollow) {
			unfollow.fn();
		}
		setUnfollow(null);
	}, [entity]);
	const handleFollowClick = useCallback(() => {
		const unfollow = game.setCameraFollowEntity(entity);
		setUnfollow({ fn: unfollow });
	}, [entity]);
	const handleUnfollowClick = useCallback(() => {
		if (unfollow) {
			unfollow.fn();
		}
		setUnfollow(null);
	}, [unfollow]);
	return (
		<HorizontalLinkList style={{ marginTop: '1em' }}>
			<Button
				onClick={() => {
					Logger.group('Selected entity');
					Logger.log(entity);
					Logger.groupEnd();
				}}
			>
				LOG
			</Button>

			{unfollow ? (
				<Button onClick={handleUnfollowClick}>Stop following</Button>
			) : (
				<Button onClick={handleFollowClick}>Follow</Button>
			)}
		</HorizontalLinkList>
	);
};

const LocalPreviewContainer = styled.div`
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

export const ActiveEntityOverlay: FunctionComponent<{ entity?: EntityI; zoom?: number }> = ({
	entity,
	zoom = 4
}) => (
	<LocalBoundary>
		<LocalBody>
			<LocalPreviewContainer>
				{entity && <ActiveEntityPreview entity={entity} />}
			</LocalPreviewContainer>
			<div>
				{entity ? (
					<>
						<EntityTextBadge entity={entity} />
						<EntityOptions entity={entity} />
					</>
				) : null}
			</div>
		</LocalBody>
	</LocalBoundary>
);
