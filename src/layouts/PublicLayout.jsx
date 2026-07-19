import { Outlet } from "react-router-dom";
import PublicFooter from "../components/PublicFooter.jsx";
import PublicHeader from "../components/PublicHeader.jsx";
import RouteScrollManager from "../components/navigation/RouteScrollManager.jsx";
import { usePublicStore } from "../hooks/usePublicStore.js";
import "../styles/client-theme.css";
import "../styles/public-mobile-layout-v27.css";

export default function PublicLayout() {
  const state = usePublicStore();

  return (
    <div
      data-public-layout="true"
      className="public-site-layout bg-white text-trap-ink"
    >
      <RouteScrollManager />

      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[110] -translate-y-24 bg-trap-blue px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-trap-yellow focus:translate-y-0"
      >
        Skip to content
      </a>

      <PublicHeader
        shop={state.store.shop}
      />

      <div
        id="main-content"
        data-public-main="true"
        className="public-site-main"
      >
        <Outlet context={state} />
      </div>

      <PublicFooter
        shop={state.store.shop}
      />
    </div>
  );
}
