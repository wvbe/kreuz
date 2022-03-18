import { Meta, Story } from '@storybook/react';
import React, { ComponentType, useCallback, useState } from 'react';
import { CivilianEntity } from '../src/entities/CivilianPersonEntity';
import { GuardEntity } from '../src/entities/GuardPersonEntity';
import { scenarios } from '../src/index';
import GlobalStyles from '../src/style/GlobalStyles';
import { Tile } from '../src/terrain/Tile';
import { JobI } from '../src/types';
import { ActiveEntityOverlay } from '../src/ui/ActiveEntityOverlay';
import { Button } from '../src/ui/components/Button';
import { ContextMenu, ContextMenuFooter } from '../src/ui/components/ContextMenu';
import { Backdrop } from './util';
import { Modal, ModalBounds } from '../src/ui/components/Modal';
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
					<Button wide onClick={() => window.alert('You asked for it')}>
						Do something
					</Button>
					<Button wide>Don't something</Button>
					<Button wide>Don't something else</Button>
					<Button wide>Don't anything</Button>
					<Button wide>Don't all</Button>
					<ContextMenuFooter>What else?</ContextMenuFooter>
				</ContextMenu>
			</div>
		</Backdrop>
	);
ui2.storyName = '<ContextMenu>';

export const Ui3: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => {
		const [clicks, setClicks] = useState(0);
		const click = useCallback(() => {
			setClicks(clicks + 1);
		}, [clicks]);
		return (
			<>
				<GlobalStyles />
				<p>Clicks: {clicks}.</p>
				<Backdrop>
					<Button onClick={click}>Normal button</Button>
				</Backdrop>
				<Backdrop>
					<Button onClick={click} wide>
						Wide button
					</Button>
				</Backdrop>
				<Backdrop>
					<Button onClick={click} active>
						Active button
					</Button>
				</Backdrop>
				<Backdrop>
					<Button onClick={click} disabled>
						Disabled button
					</Button>
				</Backdrop>
				<Backdrop>
					<Button onClick={click} active disabled>
						Active & disabled button
					</Button>
				</Backdrop>
			</>
		);
	};
Ui3.storyName = '<Button>';

export const Ui4: Story<typeof scenarios.DualMesh extends ComponentType<infer P> ? P : unknown> =
	args => (
		<>
			<GlobalStyles />
			<Backdrop height={'100%'}>
				<Modal initialPosition={[100, 200]}>
					<p>Fucking hell</p>
				</Modal>
			</Backdrop>
		</>
	);
Ui4.storyName = '<Modal>';
