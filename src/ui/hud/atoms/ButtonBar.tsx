import { FC, PropsWithChildren } from 'react';
import styles from './ButtonBar.module.css';
import { Panel } from './Panel';

export const ButtonBar: FC<
	PropsWithChildren<{ stretchy?: boolean; style?: React.CSSProperties }>
> = ({ children, stretchy, style }) => {
	return (
		<Panel className={`${styles.bar} ${stretchy ? styles.stretchy : ''}`} style={style}>
			{children}
		</Panel>
	);
};
