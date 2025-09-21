import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { CryptoFlow } from "./CryptoFlow";
import { SharedSecretDecrypt } from "./components/SharedSecretDecrypt";
import "./index.css";

export function App() {
	return (
		<Router hook={useHashLocation}>
			<div className="app">
				<Switch>
					<Route path="/share">
						<SharedSecretDecrypt />
					</Route>
					<Route>
						<CryptoFlow />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}

export default App;
