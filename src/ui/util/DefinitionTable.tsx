import React, { ReactNode } from 'react';
import styles from './DefinitionTable.module.css';

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
		<div className={styles['definition-table']}>
			{data.map(({ key, value }) => (
				<div key={key} className={styles['definition-row']}>
					<div className={styles['definition-key']}>
						<strong>{key}:</strong>
					</div>
					<div className={styles['definition-value']}>{value}</div>
				</div>
			))}
		</div>
	);
};
