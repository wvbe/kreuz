import React, { FC, PropsWithChildren } from 'react';

export const Modal: FC<
	PropsWithChildren<{
		title: string;
		onCancel: () => void;
		onSubmit: () => void;
		canSubmit?: boolean;
	}>
> = ({ title, children, onCancel, onSubmit, canSubmit }) => {
	return (
		<div className="panel modal">
			<div className="panel-header modal-header">
				<div>{title}</div>
				<div onClick={onCancel}>x</div>
			</div>
			<div className="modal-body">{children}</div>
			<div className="modal-footer">
				<div>
					<button onClick={onCancel}>Cancel</button>
				</div>
				<div>
					<button onClick={onSubmit} disabled={canSubmit === false}>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
};
