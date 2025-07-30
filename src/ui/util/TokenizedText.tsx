import { FunctionComponent, useMemo } from 'react';
import { useReplacementSpaceContext } from '../contexts/ReplacementSpaceContext';

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
				return `[${_key}: ${token}]`;
			}),
		[space, text],
	);
	return <>{replaced}</>;
};
