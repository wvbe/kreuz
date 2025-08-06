import { FC, PropsWithChildren } from 'react';
import { Panel } from '../hud/atoms/Panel';

export const GameActionBar: FC<PropsWithChildren> = ({ children }) => {
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
