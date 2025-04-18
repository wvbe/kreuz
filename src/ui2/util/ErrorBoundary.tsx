import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import React, { Component, createElement } from 'react';
type ErrorBoundaryProps = PropsWithChildren<{
	/**
	 * A custom bit of UI to render in case of an error. Leave undefined or `null` for none.
	 */
	fallbackComponent?: React.FC;
}>;

type ErrorBoundaryState = {
	error: Error | null;
};

const ErrorMessage: React.FC<{ error: Error }> = ({ error }) => {
	return (
		<div
			style={{
				backgroundColor: 'black',
				padding: '0.25rem',
				color: 'red',
				fontFamily: 'sans-serif',
			}}
		>
			<b>This component had an error</b>
			<br />
			{error.message}
		</div>
	);
};

/**
 * A component that limits the "crash" of an error in any of its child components. Additionally, it will
 * log this error to Firebase Crashlytics.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	public state = { error: null };

	public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	public componentDidCatch(error: Error, info: ErrorInfo): void {
		const description = `Error boundary: ${error.message}`;
		console.error(error, description, info);
	}

	public render(): ReactNode {
		if (this.state.error) {
			return createElement(this.props.fallbackComponent ?? ErrorMessage, {
				error: this.state.error,
			});
		}
		return this.props.children;
	}
}
