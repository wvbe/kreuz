import { FC, PropsWithChildren } from 'react';
import { Panel } from '../hud/atoms/Panel';
import { useSelectedToolStore } from '../stores/selectedActionStore';

export const GameActionBar: FC<PropsWithChildren> = ({ children }) => {
	const selectedEntity = useSelectedToolStore((state) => state.selectedAction);
	return (
		<>
			<Panel data-component='GameActionBar' className='game-action-bar'>
				{children}

				{/* {/* <Button
				icon='🔍'
				layout='tile'
				onClick={setPaintModeNull}
				active={tilePaintMode === null}
			>
				Pan
			</Button> */}
				{/* <Popover
				closeOnOutsideClick={false}
				renderPopoverAnchor={({ open, close, isOpen }) => (
					<Button
						icon='🧱'
						layout='tile'
						onClick={() => {
							isOpen ? close() : open();
							setPaintModeNull();
						}}
						active={isOpen}
					>
						Build
					</Button>
				)}
				renderPopoverContents={() => (
					<div className='game-action-bar'>{furnitureButtons}</div>
				)} */}
			</Panel>
		</>
	);
};
