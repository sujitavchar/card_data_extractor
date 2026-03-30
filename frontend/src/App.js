import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthScreen from "./screens/AuthScreen";
import ExtractScreen from "./screens/ExtractScreen";
import SingleScanScreen from "./screens/SingleScanScreen";
import BothScanScreen from "./screens/BothScanScreen";
import ResultScreen from "./screens/ResultScreen";
import CardsScreen from "./screens/CardsScreen";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthScreen />} />
          <Route path="/extract" element={<ExtractScreen />} />
          <Route path="/single" element={<SingleScanScreen />} />
          <Route path="/both" element={<BothScanScreen />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="/cards" element={<CardsScreen />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}