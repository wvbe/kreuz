import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { scenarios } from '../.';

ReactDOM.render(<scenarios.DualMesh />, document.getElementById('root'));
