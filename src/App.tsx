import { Router, Route, Switch } from "wouter";
import { CryptoFlow } from "./CryptoFlow";
import { SharedSecretDecrypt } from "./components/SharedSecretDecrypt";
import "./index.css";

export function App() {
  return (
    <Router>
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
