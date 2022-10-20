import { type FunctionComponent, ReactNode, DetailedHTMLProps, HTMLAttributes } from 'react';

export const Table: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableElement>, HTMLTableElement>
> = ({ children, ...rest }) => (
	<table {...rest}>
		<tbody>{children}</tbody>
	</table>
);

export const Row: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>
> = ({ children, ...rest }) => <tr {...rest}>{children}</tr>;

export const Cell: FunctionComponent<
	DetailedHTMLProps<HTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>
> = ({ children, ...rest }) => <td {...rest}>{children}</td>;
