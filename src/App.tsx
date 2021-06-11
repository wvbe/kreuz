import React from 'react';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import DemoCubes from './demos/demo.cubes';
import SceneHelloWorld from './demos/scene.hello-world';

function Demos() {
	return (
		<>
			<ul>
				<li>
					<Link to="/tests">Tests</Link>
				</li>
			</ul>
			<Route exact path="/tests" component={DemoCubes} />
		</>
	);
}

function App() {
	return (
		<Switch>
			<Route exact path="/" component={SceneHelloWorld} />
			<Route component={Demos} />
		</Switch>
	);
}

export default App;
