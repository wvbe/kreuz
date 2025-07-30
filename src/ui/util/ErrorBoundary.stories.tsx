import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * ErrorBoundary is a React component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
const meta: Meta<typeof ErrorBoundary> = {
	title: 'UI/Util/ErrorBoundary',
	component: ErrorBoundary,
	parameters: {
		docs: {
			description: {
				component: `
ErrorBoundary catches JavaScript errors in child components and displays a fallback UI.
It prevents the entire app from crashing when a component encounters an error.

## Features
- Catches errors in child components
- Displays customizable fallback UI
- Logs errors to console for debugging
- Prevents error propagation to parent components
				`,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/**
 * A component that intentionally throws an error to demonstrate the ErrorBoundary
 */
const BuggyComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
	if (shouldThrow) {
		throw new Error('This is a simulated error for demonstration purposes');
	}
	return <div>This component works normally when shouldThrow is false</div>;
};

/**
 * A custom fallback component that provides a more user-friendly error display
 */
const CustomFallback: React.FC<{ error: Error }> = ({ error }) => {
	return (
		<div
			style={{
				backgroundColor: '#fef2f2',
				border: '1px solid #fecaca',
				borderRadius: '8px',
				padding: '16px',
				margin: '8px',
				color: '#991b1b',
				fontFamily: 'system-ui, sans-serif',
			}}
		>
			<h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>⚠️ Something went wrong</h3>
			<p style={{ margin: '0 0 8px 0' }}>
				We encountered an error while rendering this component.
			</p>
			<details style={{ fontSize: '14px' }}>
				<summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
					Technical Details
				</summary>
				<pre
					style={{
						backgroundColor: '#f3f4f6',
						padding: '8px',
						borderRadius: '4px',
						marginTop: '8px',
						overflow: 'auto',
						fontSize: '12px',
					}}
				>
					{error.message}
				</pre>
			</details>
		</div>
	);
};

/**
 * Interactive story that allows toggling between working and error states
 */
export const Interactive: Story = {
	args: {
		children: <BuggyComponent shouldThrow={false} />,
	},
	render: (args) => {
		const [shouldThrow, setShouldThrow] = React.useState(false);

		return (
			<div>
				<div style={{ marginBottom: '16px' }}>
					<button
						onClick={() => setShouldThrow(!shouldThrow)}
						style={{
							padding: '8px 16px',
							backgroundColor: shouldThrow ? '#dc2626' : '#059669',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						{shouldThrow ? 'Fix Error' : 'Trigger Error'}
					</button>
					<span style={{ marginLeft: '8px' }}>
						Current state: {shouldThrow ? 'Will throw error' : 'Working normally'}
					</span>
				</div>
				<ErrorBoundary {...args}>
					<BuggyComponent shouldThrow={shouldThrow} />
				</ErrorBoundary>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Interactive demonstration where you can toggle between working and error states to see how the error boundary responds.',
			},
		},
	},
};

/**
 * Demonstrates the error boundary with a custom fallback component
 */
export const WithCustomFallback: Story = {
	args: {
		fallbackComponent: CustomFallback,
		children: <BuggyComponent />,
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the error boundary with a custom fallback component that provides a more user-friendly error display.',
			},
		},
	},
};
