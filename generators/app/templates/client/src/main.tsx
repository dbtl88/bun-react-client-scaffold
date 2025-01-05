import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
// import { CookiesProvider } from "react-cookie";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        {/* <CookiesProvider defaultSetOptions={{ path: "/" }}> */}
        <App />
        {/* </CookiesProvider> */}
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
