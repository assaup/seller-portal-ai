import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdEditPage from "./pages/AdEditPage/AdEditPage";
import AdViewPage from "./pages/AdViewPage/AdViewPage";
import AdsListPage from "./pages/AdsListPage/AdsListPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import "./styles";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ads" replace />}></Route>
        <Route path="/ads" element={<AdsListPage />}></Route>
        <Route path="/ads/:id" element={<AdViewPage />}></Route>
        <Route path="/ads/:id/edit" element={<AdEditPage />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>
    </BrowserRouter>
  );
}
