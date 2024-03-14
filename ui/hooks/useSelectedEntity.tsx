import { EcsEntity } from '@lib';
import * as React from 'react';
import { FC, PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { ROUTE_ENTITIES_DETAILS } from '../routes/ROUTES.ts';
import { useNavigation } from './useNavigation.ts';

type SelectedEntityContext = {
	current: EcsEntity<any> | null;
	set: (entity: EcsEntity<any> | null) => void;
};

const Context = createContext<SelectedEntityContext>({
	current: null,
	set() {},
});

export function useSelectedEntity(): SelectedEntityContext {
	return useContext(Context);
}

export const SelectedEntityContextProvider: FC<PropsWithChildren> = ({ children }) => {
	const [current, setCurrent] = useState<SelectedEntityContext['current']>(null);
	const navigate = useNavigation();
	const set = React.useCallback(
		(entity: EcsEntity<any> | null) => {
			setCurrent(entity);
			if (!entity) {
				return;
			}
			return navigate(ROUTE_ENTITIES_DETAILS, { entityId: entity.id });
		},
		[setCurrent],
	);
	const value = useMemo<SelectedEntityContext>(() => ({ current, set }), [current, set]);
	return <Context.Provider value={value}>{children}</Context.Provider>;
};
