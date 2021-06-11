import { Global } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App from './App';
import globalStyleRules from './styles';

ReactDOM.render(
	<React.StrictMode>
		<Global styles={globalStyleRules} />
		<HashRouter hashType={'slash'}>
			<App />
		</HashRouter>
	</React.StrictMode>,
	document.getElementById('root')
);
