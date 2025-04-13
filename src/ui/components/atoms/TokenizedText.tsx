import React, { useMemo, type FunctionComponent } from 'react';
import { useReplacementSpaceContext } from '../../context/ReplacementSpaceContext';
import { EntityLink } from '../../entities/EntityLink';

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
				return <EntityLink key={i} entity={item} />;
			}),
		[space, text],
	);
	return <>{replaced}</>;
};
