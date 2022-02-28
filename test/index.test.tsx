import React from 'react';
import * as ReactDOM from 'react-dom';
import Demo from '../src/scenarios/DualMesh';
import { act } from 'react-dom/test-utils';
describe('Demo', () => {
	it('renders without crashing', () => {
		act(() => {
			const div = document.createElement('div');
			ReactDOM.render(<Demo />, div);
			ReactDOM.unmountComponentAtNode(div);
		});
	});
});
