"use client";

import { usePathname } from "next/navigation";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState, createContext, useContext } from "react";

const SidebarContext = createContext({ isCollapsed: false, setIsCollapsed: (value: boolean) => {} });

export const useSidebar = () => useContext(SidebarContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login";
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {!isAuthRoute && <Sidebar />}
      <div className={!isAuthRoute ? (isCollapsed ? "lg:pl-20" : "lg:pl-64") : ""}>
        {!isAuthRoute && <Topbar />}
        {children}
        {!isAuthRoute && <Footer />}
      </div>
    </SidebarContext.Provider>
  );
}
