import React from 'react';
import './EntityControls.css';
import { RoundGlass } from './RoundGlass';

interface EntityInfo {
	key: string;
	value: string;
}

interface ButtonAction {
	label: string;
	onClick: () => void;
}

interface EntityControlsProps {
	visual: React.ReactNode;
	entityInfo: EntityInfo[];
	actions?: ButtonAction[];
}

const EntityControls: React.FC<EntityControlsProps> = ({ visual, entityInfo, actions }) => {
	return (
		<div className='entity-controls'>
			<div className='entity-preview-container'>
				<RoundGlass>{visual}</RoundGlass>
			</div>
			<div className='entity-info-container'>
				<div className='entity-info'>
					{entityInfo.map((info) => (
						<div key={info.key}>
							<strong>{info.key}:</strong> {info.value}
						</div>
					))}
				</div>
				{actions && (
					<div className='entity-actions'>
						{actions.map((action, index) => (
							<button key={index} onClick={action.onClick}>
								{action.label}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EntityControls;
