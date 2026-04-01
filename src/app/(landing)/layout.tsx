"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/utils/token-storage";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if logged in and on the home page
        if (pathname === "/" && isAuthenticated()) {
            router.replace("/dashboard");
        }
    }, [pathname, router]);

    return (
        <div className="flex-1 flex flex-col relative min-h-screen bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden scroll-smooth">
            <main className="flex-1 w-full flex flex-col items-center">
                {children}
            </main>
        </div>
    );
}
