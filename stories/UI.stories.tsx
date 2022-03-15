import React, { ComponentType } from 'react';
import { Meta, Story } from '@storybook/react';
import { scenarios } from '../src/index';
import { ActiveEntityOverlay } from '../src/ui/ActiveEntityOverlay';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { Tile } from '../src/terrain/Tile';
import { JobI } from '../src/types';
import { Backdrop } from './util';
import {
	ContextMenu,
	ContextMenuButton,
	ContextMenuFooter
} from '../src/ui/components/ContextMenu';
import GlobalStyles from '../src/ui/components/GlobalStyles';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';

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

class DemoJob implements JobI {
	label: string;
	constructor(label: string) {
		this.label = label;
	}
	start() {}
	destroy() {}
}

export const ui1: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
		<>
			<GlobalStyles />
			<Backdrop>
				<ActiveEntityOverlay />
			</Backdrop>
			<Backdrop>
				<ActiveEntityOverlay
					entity={(() => {
						const entity = new GuardEntity('test', new Tile(0, 0, 0));
						entity.doJob(new DemoJob('Doing the rounds'));
						return entity;
					})()}
				/>
			</Backdrop>
			<Backdrop>
				<ActiveEntityOverlay
					entity={(() => {
						const entity = new CivilianEntity('test', new Tile(0, 0, 0));
						entity.doJob(new DemoJob('Wandering around'));
						return entity;
					})()}
				/>
			</Backdrop>
		</>
	);
ui1.storyName = '<ActiveEntityOverlay>';

export const ui2: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
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
ui2.storyName = '<ContextMenu>';
