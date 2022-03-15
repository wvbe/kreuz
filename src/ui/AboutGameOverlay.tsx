import styled from '@emotion/styled';
import React, { FunctionComponent } from 'react';
import { useGame } from '../hooks/game';

const Wrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-top: 1em;
	font-size: 0.8em;
`;

export const AboutGameOverlay: FunctionComponent = () => {
	const game = useGame();

	return (
		<Wrapper>
			<a
				href="https://github.com/wvbe/kreuzzeug-im-nagelhosen"
				target="_blank"
				rel="noreferrer"
			>
				GitHub
			</a>
			<div style={{ width: '4em' }}></div>
			<span>Seed: {game.seed}</span>
		</Wrapper>
	);
};
