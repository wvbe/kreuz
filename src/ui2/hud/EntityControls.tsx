import React from 'react';
import TabbedSlider, { Tab } from '../util/TabbedSlider';
import './EntityControls.css';
import { RoundGlass } from './RoundGlass';
import { DefinitionTable } from '../util/DefinitionTable';

export interface EntityControlsProps {
	visual: React.ReactNode;
	entityInfo: { key: string; value: React.ReactNode }[];
	tabs?: Tab[];
}

const EntityControls: React.FC<EntityControlsProps> = ({ visual, entityInfo, tabs }) => {
	return (
		<div className='entity-controls'>
			<div className='entity-preview-container'>
				<RoundGlass>{visual}</RoundGlass>
			</div>
			<div className='entity-info-container'>
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
