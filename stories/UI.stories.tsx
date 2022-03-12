import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';
import { ActiveEntityOverlay } from '../src/ui/ActiveEntityOverlay';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { GenericTile } from '../src/terrain/GenericTile';
import { Backdrop } from './util';
import { ContextMenu, ContextMenuButton, ContextMenuFooter } from '../src/ui/ContextMenu';
import GlobalStyles from '../src/ui/GlobalStyles';

const meta: Meta = {
	title: 'UI',
	argTypes: {
		children: {
			control: {
				type: 'text'
			}
		}
	},
	parameters: {
		controls: { expanded: true }
	}
};

export default meta;

export const ActiveEntity: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => (
	<Backdrop>
		<GlobalStyles />
		<ActiveEntityOverlay entity={new GuardEntity('test', new GenericTile(0, 0, 0))} />
	</Backdrop>
);

export const contextMenu: Story<
	typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown
> = args => (
	<Backdrop height={250}>
		<GlobalStyles />
		<div style={{ position: 'absolute', bottom: '1em', left: '50%' }}>
			<ContextMenu>
				<ContextMenuButton onClick={() => window.alert('You asked for it')}>
					Do something
				</ContextMenuButton>
				<ContextMenuButton>Don't something</ContextMenuButton>
				<ContextMenuButton>Don't something else</ContextMenuButton>
				<ContextMenuButton>Don't anything</ContextMenuButton>
				<ContextMenuButton>Don't all</ContextMenuButton>
				<ContextMenuFooter>What else?</ContextMenuFooter>
			</ContextMenu>
		</div>
	</Backdrop>
);
