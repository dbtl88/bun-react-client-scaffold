import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import NavBar from "./components/layout/Navbar";
import HelmetWrapper from "./components/utility/HelmetWrapper";

function App() {
  return (
      <HelmetWrapper>
        <Routes>
          <Route path="/" element={<NavBar />}>
            <Route index element={<LandingPage />} />
          </Route>
        </Routes>
      </HelmetWrapper>
  );
}

export default App;