import { useEffect, useState } from "react";
import { CryptoFlow } from "./CryptoFlow";
import { SharedSecretDecrypt } from "./components/SharedSecretDecrypt";
import "./index.css";

function resolveCurrentPage() {
	const urlParams = new URLSearchParams(window.location.search);
	const page = urlParams.get("page");
	if (page) return page;
	return "home";
}

export function App() {
	const [currentPage, setCurrentPage] = useState<string>(() =>
		resolveCurrentPage(),
	);

	// Check URL parameters on mount and when URL changes
	useEffect(() => {
		const listener = () => {
			const page = resolveCurrentPage();
			setCurrentPage(page);
		};
		// Listen for popstate events (back/forward navigation)
		window.addEventListener("popstate", listener);
		return () => window.removeEventListener("popstate", listener);
	}, []);

	return (
		<div className="app">
			{currentPage === "share" && <SharedSecretDecrypt />}
			{currentPage === "home" && <CryptoFlow />}
		</div>
	);
}

export default App;
