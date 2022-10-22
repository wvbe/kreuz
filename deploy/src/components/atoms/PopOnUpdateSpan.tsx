import {
	DetailedHTMLProps,
	FunctionComponent,
	HTMLAttributes,
	useCallback,
	useEffect,
	useRef,
} from 'react';

export const PopOnUpdateSpan: FunctionComponent<
	{ text: string } & DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = ({ text, ...rest }) => {
	const clicks = useRef(0);
	const element = useRef<HTMLSpanElement | null>(null);
	const last = useRef<string | null>(null);
	const setElementRef = useCallback((el: HTMLSpanElement) => (element.current = el), []);
	useEffect(function performPopOnUpdateAnimation() {
		if (!element.current) {
			return;
		}
		clicks.current++;
		if (clicks.current <= 2) {
			// First update is for the component
			// Second update is for the initial text update coming in
			// All other updates are actual changes
			// @TODO maybe refactor to actually check if theres a difference in text.
			return;
		}

		if (last.current === text) {
			return;
		}
		last.current = text;

		const ghost = element.current.ownerDocument.createElement('span');
		ghost.setAttribute(
			'style',
			'background-color: lightgray; position: absolute; top: 0; left: 0; right: 0; bottom: 0; transition: background-color 2s;',
		);
		element.current.insertBefore(ghost, null);

		setTimeout(() => {
			ghost.style.backgroundColor = 'transparent';
		}, 10);

		const remove = () => ghost.parentElement?.removeChild(ghost);
		const timeout = setTimeout(remove, 2000);
		// return () => remove() && clearTimeout(timeout);
	});
	return (
		<span {...rest} style={{ position: 'relative', padding: '0 3px' }} ref={setElementRef}>
			<span style={{ position: 'relative', zIndex: 1 }}>{text}</span>
		</span>
	);
};
