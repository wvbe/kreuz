import { type DetailedHTMLProps, type FunctionComponent, type HTMLAttributes } from 'react';

/**
 * @deprecated This component does nothing any more
 */
export const PopOnUpdateSpan: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>
> = ({ children, ...rest }) => {
	return <span {...rest}>{children}</span>;
};
