import React, { FC, PropsWithChildren } from 'react';

export const Modal: FC<
	PropsWithChildren<{
		title: string;
		onCancel: () => void;
		onSubmit: () => void;
	}>
> = ({ title, children, onCancel, onSubmit }) => {
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
					<button onClick={onSubmit}>Submit</button>
				</div>
			</div>
		</div>
	);
};
