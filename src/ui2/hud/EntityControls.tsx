import React, { ReactNode } from 'react';
import { DefinitionTable } from '../util/DefinitionTable';
import TabbedSlider, { Tab } from '../util/TabbedSlider';
import { EntityBadge } from './EntityBadge';
import './EntityControls.css';
import { RoundGlass } from './atoms/RoundGlass';

export interface EntityControlsProps {
	icon: string | React.ReactNode;
	title: ReactNode;
	subtitle: ReactNode;
	entityInfo: { key: string; value: React.ReactNode }[];
	tabs?: Tab[];
}

const EntityControls: React.FC<EntityControlsProps> = ({
	icon,
	title,
	subtitle,
	entityInfo,
	tabs,
}) => {
	return (
		<div className='entity-controls'>
			<div className='entity-preview-container'>
				<RoundGlass>{icon}</RoundGlass>
			</div>
			<div className='entity-info-container'>
				<EntityBadge title={title} subtitle={subtitle} hideIcon={true} />
				<DefinitionTable data={entityInfo} />
				{tabs && tabs.length > 0 && (
					<div className='entity-tabs'>
						<TabbedSlider tabs={tabs} />
					</div>
				)}
			</div>
		</div>
	);
};

export default EntityControls;
