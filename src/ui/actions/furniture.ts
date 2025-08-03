
	// const furnitureButtons = useMemo<ReactNode[]>(() => {
	// 	const createProps = (furniture: Constructible): ButtonProps => {
	// 		const id = `construct.${furniture.label}`;
	// 		return {
	// 			children: furniture.label,
	// 			icon: furniture.symbol,
	// 			layout: 'tile',
	// 			active: tilePaintMode?.id === id,
	// 			onClick: async () => {
	// 				const tiles = await new RectangularSelectionTool(id).asPromise(game);
	// 				setTilePaintMode({
	// 					id,
	// 					highlightColor: new Color('red'),
	// 					onDragComplete: (tiles) => {
	// 						for (const tile of tiles) {
	// 							if (!ConstructionJob.tileIsBuildable(game, tile)) {
	// 								continue;
	// 							}
	// 							game.jobs.add(
	// 								JobPriority.NORMAL,
	// 								new ConstructionJob(tile, furniture),
	// 							);
	// 						}
	// 					},
	// 				});
	// 			},
	// 		};
	// 	};
	// 	return [
	// 		createProps(woodenChair),
	// 		createProps(woodenBed),
	// 		createProps(woodenTable),
	// 		createProps(woodenStool),
	// 		createProps(woodenCabinet),
	// 		createProps(woodenFootrest),
	// 	].map((props) => <Button {...props} />);
	// }, [tilePaintMode, setTilePaintMode, game]);
