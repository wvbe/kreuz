import { FC, PropsWithChildren } from 'react';
import styles from './ButtonBar.module.css';
import { Panel } from './Panel';

export const ButtonBar: FC<PropsWithChildren<{ stretchy?: boolean }>> = ({
	children,
	stretchy,
}) => {
	return <Panel className={`${styles.bar} ${stretchy ? styles.stretchy : ''}`}>{children}</Panel>;
};
