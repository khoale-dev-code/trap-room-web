
import { Loader2 } from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { api } from "../lib/api.js";
import AdminShell from "./AdminShell.jsx";
import CategoriesManager from "./pages/content/CategoriesManager.jsx";
import DashboardView from "./pages/workspace/DashboardView.jsx";
import GalleryManager from "./pages/publishing/GalleryManager.jsx";
import JournalPostsManager from "./pages/publishing/JournalPostsManager.jsx";
import LoginView from "./pages/auth/LoginView.jsx";
import MenuItemsManager from "./pages/content/MenuItemsManager.jsx";
import ReservationsManager from "./pages/operations/ReservationsManager.jsx";
import ResourceManager from "./pages/content/ResourceManager.jsx";
import ShopManager from "./pages/store/ShopManager.jsx";
import TranslationsManager from "./pages/system/TranslationsManager.jsx";
import { resourceConfig } from "./adminConfig.js";
import "./styles/admin-theme.css";
import AdminGuideManager from "./pages/workspace/AdminGuideManager.jsx";
import EmployeesManager from "./pages/operations/EmployeesManager.jsx";
import WorkScheduleManager from "./pages/operations/WorkScheduleManager.jsx";
import MyScheduleManager from "./pages/operations/MyScheduleManager.jsx";
import { canAccessTab, getFirstAllowedTab } from "./access.js";
import "../styles/admin-responsive-2026.css";
import "./adminResponsiveRuntime.js";

export default function AdminApp() {
  const [admin, setAdmin] =
    useState(null);
  const [checking, setChecking] =
    useState(true);
  const [authError, setAuthError] =
    useState("");
  const [activeTab, setActiveTab] =
    useState("dashboard");
  const [refreshToken, setRefreshToken] =
    useState(0);

  useEffect(() => {
    api.auth
      .me()
      .then((data) =>
        setAdmin(data.admin)
      )
      .catch(() => setAdmin(null))
      .finally(() =>
        setChecking(false)
      );
  }, []);

  async function login(form) {
    try {
      setAuthError("");

      const data =
        await api.auth.login(form);

      setAdmin(data.admin);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function logout() {
    await api.auth
      .logout()
      .catch(() => null);

    setAdmin(null);
    setActiveTab("dashboard");
  }

  function refresh() {
    setRefreshToken(
      (value) => value + 1
    );
  }

  
  useEffect(() => {
    if (
      admin &&
      !canAccessTab(admin, activeTab)
    ) {
      setActiveTab(
        getFirstAllowedTab(admin)
      );
    }
  }, [admin, activeTab]);

if (checking) {
    return (
      <main className="admin-page grid min-h-screen place-items-center">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-trap-blue text-trap-yellow shadow-xl">
            <Loader2
              className="animate-spin"
              size={28}
            />
          </span>

          <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-trap-blue/55">
            Checking admin session
          </p>
        </div>
      </main>
    );
  }

  if (!admin) {
    return (
      <LoginView
        onLogin={login}
        error={authError}
      />
    );
  }

  let content;

  if (!canAccessTab(admin, activeTab)) {
    content = (
      <section className="admin-card p-8 text-center">
        <h2 className="text-2xl font-extrabold text-trap-blue">
          Access denied for this account
        </h2>
        <p className="mt-3 text-sm font-medium text-trap-ink/55">
          Ask the owner or manager to update this employee's permissions.
        </p>
      </section>
    );
  } else if (activeTab === "dashboard") {
    content = (
      <DashboardView
        refreshToken={refreshToken}
        onNavigate={setActiveTab}
      />
    );
  } else if (activeTab === "shop") {
    content = (
      <ShopManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "categories") {
    content = (
      <CategoriesManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "products") {
    content = (
      <MenuItemsManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "posts") {
    content = (
      <JournalPostsManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "gallery") {
    content = (
      <GalleryManager
        refreshToken={refreshToken}
      />
    );
  } else if (
    activeTab === "translations"
  ) {
    content = (
      <TranslationsManager
        refreshToken={refreshToken}
      />
    );
  } else if (
    activeTab === "reservations"
  ) {
    content = (
      <ReservationsManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "guide") {
    content = (
      <AdminGuideManager
        refreshToken={refreshToken}
        onNavigate={setActiveTab}
      />
    );
  } else if (activeTab === "employees") {
    content = (
      <EmployeesManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "schedules") {
    content = (
      <WorkScheduleManager
        refreshToken={refreshToken}
      />
    );
  } else if (activeTab === "my-schedule") {
    content = (
      <MyScheduleManager
        refreshToken={refreshToken}
      />
    );
  } else {
    content = (
      <ResourceManager
        config={
          resourceConfig[activeTab]
        }
        refreshToken={refreshToken}
      />
    );
  }

  return (
    <AdminShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      admin={admin}
      onLogout={logout}
      onRefresh={refresh}
    >
      {content}
    </AdminShell>
  );
}
