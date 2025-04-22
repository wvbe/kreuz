import React, { ReactNode } from 'react';
import './DefinitionTable.css';

/**
 * A React component that displays a flexbox-based list of key-value pairs.
 *
 * @param data - A record of string keys and string/ReactNode values to display.
 *
 * @returns A JSX element displaying the data in a flexbox format.
 */
export const DefinitionTable: React.FC<{ data: { key: string; value: ReactNode }[] }> = ({
	data,
}) => {
	return (
		<div className='definition-table'>
			{data.map(({ key, value }) => (
				<div key={key} className='definition-row'>
					<div className='definition-key'>
						<strong>{key}:</strong>
					</div>
					<div className='definition-value'>{value}</div>
				</div>
			))}
		</div>
	);
};
