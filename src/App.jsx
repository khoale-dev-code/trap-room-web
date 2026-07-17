import { Route, Routes } from "react-router-dom";
import AdminApp from "./admin/AdminApp.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import PostsPage from "./pages/PostsPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import PromotionsPage from "./pages/PromotionsPage.jsx";
import ReservationPage from "./pages/ReservationPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminApp />} />
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:id" element={<ProductDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
      </Route>
    </Routes>
  );
}
