import React from 'react';
import './EntityControls.css';
import { RoundGlass } from './RoundGlass';

const EntityControls: React.FC<{
	visual: React.ReactNode;
	entityInfo: {
		key: string;
		value: string;
	}[];
	actions?: {
		label: string;
		onClick: () => void;
	}[];
}> = ({ visual, entityInfo, actions }) => {
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
