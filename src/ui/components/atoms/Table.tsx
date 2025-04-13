import React, {
	type FunctionComponent,
	ReactNode,
	DetailedHTMLProps,
	HTMLAttributes,
	useMemo,
} from 'react';

export const Table: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableElement>, HTMLTableElement>
> = ({ children, ...rest }) => (
	<table {...rest}>
		<tbody>{children}</tbody>
	</table>
);

export const Row: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>
> = ({ children, ...rest }) => {
	const classNames = useMemo(() => {
		const classNames = [];
		if (rest.onClick) {
			classNames.push('clickable');
		}
		if (rest['aria-selected']) {
			classNames.push('selected');
		}
		return classNames.join(' ');
	}, [rest.onClick, rest['aria-selected']]);

	return (
		<tr className={classNames} {...rest}>
			{children}
		</tr>
	);
};

export const Cell: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>
> = ({ children, ...rest }) => <td {...rest}>{children}</td>;
