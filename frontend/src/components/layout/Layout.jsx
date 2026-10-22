// src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import SidebarMenu from "../SidebarMenu";
import Breadcrumb from "../Breadcrumb";

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Sidebar-ı yığmaq/açmaq funksiyası
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const mainContentStyle = {
    marginLeft: isCollapsed ? "84px" : "254px",
    width: isCollapsed ? "calc(100% - 84px)" : "calc(100% - 254px)",
    maxWidth: isCollapsed ? "calc(100% - 84px)" : "calc(100% - 254px)",
    minWidth: 0,
  };

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      <div>
        <SidebarMenu isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300" style={mainContentStyle}>
        <Header />
        <Breadcrumb />
        <main className="p-4 w-full flex-1 flex flex-col min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
