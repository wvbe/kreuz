import React, { useMemo, type FunctionComponent } from 'react';

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
				return <a href="#">{item ? item.label : token}</a>;
			}),
		[space, text],
	);
	return <>{replaced}</>;
};
