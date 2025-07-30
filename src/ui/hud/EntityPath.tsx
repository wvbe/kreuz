import { FC } from 'react';
import { PathableTileEntity } from '../../game/core/ecs/components/pathingComponent';

import './EntityPath.css';
const EntityPathStep: FC<{ tile: PathableTileEntity | null; isCurrent: boolean }> = ({
	tile,
	isCurrent,
}) => {
	return <div className={`entity-path-step ${isCurrent ? 'current' : ''}`}></div>;
};

export const EntityPath: FC<{
	tiles: PathableTileEntity[] | null;
	currentTile?: PathableTileEntity;
	nextTile?: PathableTileEntity;
}> = ({ tiles, currentTile, nextTile }) => {
	const isCurrentTileCurrent = !tiles?.includes(nextTile!);

	return (
		<div className='entity-path'>
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
