"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { GlobalBackground } from "@/components/layout/global-background";
import AppSidebar from "@/components/layout/app-sidebar";
import { useActiveBackground } from "@/hooks/background";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    useActiveBackground();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <ProtectedRoute requireAuth={true} redirectTo="/sign-in">
            <div className="w-screen h-screen relative">
                <GlobalBackground />

                <AppSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

                <div className="relative flex h-full min-h-0 flex-col lg:pl-[300px]">
                    <main className="relative flex-1 min-h-0 overflow-y-auto">{children}</main>
                </div>

            </div>
        </ProtectedRoute>
    );
}