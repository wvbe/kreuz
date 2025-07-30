import { FC, useMemo } from 'react';
import { tileArchetype } from '../../game/core/ecs/archetypes/tileArchetype';
import { byEcsComponents } from '../../game/core/ecs/assert';
import { locationComponent } from '../../game/core/ecs/components/locationComponent';
import { visibilityComponent } from '../../game/core/ecs/components/visibilityComponent';
import { EcsEntity } from '../../game/core/ecs/types';
import { useGameContext } from '../contexts/GameContext';
import { useCollection } from '../hooks/useEventedValue';
import { GameMapEntity } from './GameMapEntity';
import { GameMapTile } from './GameMapTile';
import { TilePaintMode, useTilePaintMode } from './hooks/useTilePaintMode';

const filterNoTiles = (entity: EcsEntity): entity is EcsEntity => !tileArchetype.test(entity);

/**
 * A component that maps the game terrain and entities to presentational components.
 *
 * This component uses the {@link GameMapTile} and {@link GameMapEntity} presentational components to display the game map.
 */
export const GameMap: FC<{ tilePaintMode: TilePaintMode | null }> = ({ tilePaintMode }) => {
	const game = useGameContext();
	const tilesCollection = useCollection(game.terrain.tiles);

	const { onTileMouseDown, onTileMouseEnter } = useTilePaintMode(tilePaintMode ?? null);

	const tiles = useMemo(() => {
		return tilesCollection.map((tile) => {
			return (
				<GameMapTile
					key={tile.id}
					tile={tile}
					onMouseDown={onTileMouseDown.bind(undefined, tile)}
					onMouseEnter={onTileMouseEnter.bind(undefined, tile)}
				/>
			);
		});
	}, [tilesCollection]);

	const entitiesCollection = useCollection(game.entities, filterNoTiles);
	const entities = useMemo(() => {
		return entitiesCollection
			.filter(byEcsComponents([locationComponent, visibilityComponent]))
			.map((tile) => {
				return <GameMapEntity key={tile.id} entity={tile} />;
			});
	}, [entitiesCollection]);

	return (
		<div data-component='GameMap' style={{ position: 'absolute', top: '50%', left: '50%' }}>
			{tiles}
			{entities}
		</div>
	);
};
