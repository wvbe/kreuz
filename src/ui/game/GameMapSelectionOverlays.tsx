import { FC, useEffect, useMemo } from 'react';
import { Collection } from '../../game/core/events/Collection';
import { EventedValue } from '../../game/core/events/EventedValue';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useCollection, useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';

export type SelectionOverlay = {
	tileCoordinates: EventedValue<QualifiedCoordinate[]>;
	colors: {
		background: string;
		border: string;
	};
};
export const selectionOverlays = new Collection<SelectionOverlay>();

export const GameMapSelectionOverlay: FC<{
	selection: SelectionOverlay;
}> = ({ selection }) => {
	useEffect(() => {}, []);
	const coordinates = useEventedValue(selection.tileCoordinates);
	const renderedCoordinates = useMemo(
		() =>
			coordinates.map((coordinate) => (
				<MapLocation
					key={String(coordinate)}
					qualifiedCoordinates={[coordinate[0], coordinate[1], coordinate[2], 0]}
					dx={1}
					dy={1}
				>
					<div
						style={{
							backgroundColor: selection.colors.background,
							border: `1px solid ${selection.colors.border}`,
							width: '100%',
							height: '100%',
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							// borderRadius: '50%',
						}}
					/>
				</MapLocation>
			)),
		[coordinates],
	);
	return <div>{renderedCoordinates}</div>;
};

export const GameMapSelectionOverlays: FC = () => {
	const selections = useCollection(selectionOverlays);

	return (
		<div data-testid='selection-overlays'>
			{selections.map((selection, index) => (
				<GameMapSelectionOverlay key={index} selection={selection} />
			))}
		</div>
	);
};
