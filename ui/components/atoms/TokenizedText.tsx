import React, { useMemo, type FunctionComponent } from 'react';
import { EntityLink } from '../EntityLink.tsx';
import { useReplacementSpaceContext } from '../../context/ReplacementSpaceContext.tsx';

export const TokenizedText: FunctionComponent<{ text: string }> = ({ text }) => {
	const space = useReplacementSpaceContext();
	const replaced = useMemo(
		() =>
			space.replace(text).map((result, i) => {
				if (typeof result === 'string') {
					return result;
				}
				const [item, _key, token] = result;
				if (!item) {
					return token;
				}
				return <EntityLink entity={item} />;
			}),
		[space, text],
	);
	return <>{replaced}</>;
};
