import styled from '@emotion/styled';
import { faCity, faPerson, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ComponentType, FunctionComponent, useCallback, useMemo, useState } from 'react';
import { activeUiPalette } from '../constants/palettes.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import { SettlementEntity } from '../entities/SettlementEntity.ts';
import { useGame } from './hooks/game.ts';
import { PRETTY_SCROLLBAR } from '../style/mixins.ts';
import { EntityI } from '../types.ts';
import { EntityTextBadge } from './ActiveEntityOverlay.tsx';
import { Button } from './components/Button.tsx';

const List = styled.ul`
	display: block;
	list-style-type: none;
	margin: 0;
	padding: 0;
`;

const Item = styled.li`
	margin: 0;
	padding: 0;
`;

const OverviewButton: FunctionComponent<{ entity: EntityI }> = ({ entity }) => {
	const game = useGame();
	const handleClick = useCallback(() => {
		game.$$focus.set(entity);
	}, [game, entity]);
	return (
		<Button wide onClick={handleClick}>
			<EntityTextBadge entity={entity} />
		</Button>
	);
};

function createOverviewComponent(filter: (entity: EntityI) => boolean) {
	const EntitiesOverview: FunctionComponent = () => {
		const game = useGame();
		const entities = useMemo(() => game.entities.filter(filter), [game.entities]);
		return (
			<List>
				{entities.map((entity) => (
					<Item key={entity.id}>
						<OverviewButton entity={entity} />
					</Item>
				))}
			</List>
		);
	};
	return EntitiesOverview;
}

type EntityOverviewTabI = {
	label: string;
	icon: IconDefinition;
	Component: ComponentType;
};

const OVERVIEWS: EntityOverviewTabI[] = [
	{
		label: 'Places',
		icon: faCity,
		Component: createOverviewComponent((entity) => entity instanceof SettlementEntity),
	},
	{
		label: 'People',
		icon: faPerson,
		Component: createOverviewComponent((entity) => entity instanceof PersonEntity),
	},
];

const Wrapper = styled.section`
	position: absolute;
	z-index: 1;
	left: 1em;
	top: 1em;
	max-height: calc(50vh);
	width: 18em;
	border-bottom: 3px solid ${activeUiPalette.darkest};
	overflow: auto;
	${PRETTY_SCROLLBAR};
`;

const ButtonBar = styled.nav`
	margin-bottom: 1em;
	& > * {
		margin-right: 1em;
	}
`;

export const EntityOverview: FunctionComponent = () => {
	const [activeOverview, setActiveOverview] = useState<EntityOverviewTabI>(OVERVIEWS[0]);

	return (
		<Wrapper>
			<ButtonBar>
				{OVERVIEWS.map((item, i) => (
					<Button key={i} onClick={() => setActiveOverview(item)} active={item === activeOverview}>
						<FontAwesomeIcon icon={item.icon} />
					</Button>
				))}
			</ButtonBar>

			<activeOverview.Component />
		</Wrapper>
	);
};
