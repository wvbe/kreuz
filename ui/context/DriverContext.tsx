import React, { type FunctionComponent, type ReactNode, createContext, useContext } from 'react';
import { type DriverI } from '@lib';

const _DriverContext = createContext<DriverI | null>(null);

export const DriverContext: FunctionComponent<{ driver: DriverI; children: ReactNode }> = ({
	driver,
	children,
}) => <_DriverContext.Provider value={driver}>{children}</_DriverContext.Provider>;

export function useDriverContext(): DriverI {
	const driver = useContext(_DriverContext);
	if (!driver) {
		throw new Error('No driver');
	}
	return driver;
}
