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
import {
	ROUTE_ENTITIES_FACTORIES_DETAILS,
	ROUTE_ENTITIES_MARKETS_DETAILS,
	generatePath,
} from '../routes/ROUTES.ts';
import { ROUTE_ENTITIES_PEOPLE_DETAILS } from '../routes/ROUTES.ts';
import { useNavigation } from './useNavigation.ts';

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
	const [current, setCurrent] = useState<SelectedEntityContext['current']>(null);
	const navigate = useNavigation();
	const set = React.useCallback(
		(entity: EntityI | null) => {
			setCurrent(entity);
			if (!entity) {
				return;
			}
			switch (entity.type) {
				case 'person':
					return navigate(ROUTE_ENTITIES_PEOPLE_DETAILS, { entityId: entity.id });
				case 'factory':
					return navigate(ROUTE_ENTITIES_FACTORIES_DETAILS, { entityId: entity.id });
				case 'market-stall':
					return navigate(ROUTE_ENTITIES_MARKETS_DETAILS, { entityId: entity.id });
			}
		},
		[setCurrent],
	);
	const value = useMemo<SelectedEntityContext>(() => ({ current, set }), [current, set]);
	return <Context.Provider value={value}>{children}</Context.Provider>;
};
