import "./App.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import { AuthProvider } from "./components/utility/AuthContext";
import NavBar from "./components/layout/Navbar";
import HelmetWrapper from "./components/utility/HelmetWrapper";

function App() {
  return (
    <AuthProvider>
      <HelmetWrapper>
        <Routes>
          <Route path="/" element={<NavBar />}>
            <Route index element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
          </Route>
        </Routes>
      </HelmetWrapper>
    </AuthProvider>
  );
}

export default App;
