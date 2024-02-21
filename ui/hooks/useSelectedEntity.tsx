import { EntityI } from '@lib';
import * as React from 'react';
import {
	Dispatch,
	FC,
	PropsWithChildren,
	SetStateAction,
	createContext,
	useContext,
	useMemo,
	useState,
} from 'react';

type SelectedEntityContext = {
	current: EntityI | null;
	set: Dispatch<SetStateAction<EntityI | null>>;
};

const Context = createContext<SelectedEntityContext>({
	current: null,
	set() {},
});

export function useSelectedEntity(): SelectedEntityContext {
	return useContext(Context);
}

export const SelectedEntityContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const [current, set] = useState<SelectedEntityContext['current']>(null);
	const value = useMemo<SelectedEntityContext>(() => ({ current, set }), [current, set]);
	return <Context.Provider value={value}>{children}</Context.Provider>;
};
