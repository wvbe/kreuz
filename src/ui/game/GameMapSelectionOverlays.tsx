import { FC, useEffect, useMemo } from 'react';
import { Collection } from '../../game/core/events/Collection';
import { EventedValue } from '../../game/core/events/EventedValue';
import { QualifiedCoordinate } from '../../game/core/terrain/types';
import { useCollection, useEventedValue } from '../hooks/useEventedValue';
import { MapLocation } from '../map/MapLocation';

type SelectionOverlay = {
	tileCoordinates: EventedValue<QualifiedCoordinate[]>;
	colors: {
		background: string;
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
					qualifiedCoordinates={coordinate}
					dx={1}
					dy={1}
					style={{ backgroundColor: selection.colors.background }}
				/>
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
