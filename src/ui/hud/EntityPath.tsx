import { FC } from 'react';
import { Tile } from '../../game/core/ecs/archetypes/tileArchetype';
import styles from './EntityPath.module.css';

const EntityPathStep: FC<{ tile: Tile | null; isCurrent: boolean }> = ({ tile, isCurrent }) => {
	return (
		<div className={`${styles['entity-path-step']} ${isCurrent ? styles.current : ''}`}></div>
	);
};

export const EntityPath: FC<{
	tiles: Tile[] | null;
	currentTile?: Tile;
	nextTile?: Tile;
}> = ({ tiles, currentTile, nextTile }) => {
	const isCurrentTileCurrent = !tiles?.includes(nextTile!);

	return (
		<div className={styles['entity-path']}>
			{currentTile ? (
				<EntityPathStep tile={currentTile} isCurrent={isCurrentTileCurrent} />
			) : null}
			{tiles === null ? null : (
				<>
					{tiles.map((tile, index) => (
						<EntityPathStep key={tile.id} tile={tile} isCurrent={tile === nextTile} />
					))}
					<EntityPathStep tile={null} isCurrent={false} />
				</>
			)}
		</div>
	);
};
