import React from "react";
import ReactDOM from "react-dom/client";

// import ReactDOM from 'react-dom';
import App from "./App";

import "./index.css";
// import Star from "./Rating.jsx";
const entryPoint = document.getElementById("root");
ReactDOM.createRoot(entryPoint).render(<App />);
// during development it will render all components twice => to find bugs
// React check if we are using outdaded parts of React API
