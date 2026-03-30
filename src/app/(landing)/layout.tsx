"use client";

import React from "react";
import LandingFooter from "@/components/layout/landing-footer";
import { ShootingStars } from "@/components/elements/shooting-stars";
import { StarsBackground } from "@/components/elements/stars-background";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/utils/token-storage";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const showStars = pathname === "/";

    useEffect(() => {
        // Redirect to dashboard if logged in and on the home page
        if (pathname === "/" && isAuthenticated()) {
            router.replace("/dashboard");
        }
    }, [pathname, router]);

    return (
        <div className="flex-1 flex flex-col relative min-h-screen bg-[#0a0a0a] text-white overflow-y-auto overflow-x-hidden scroll-smooth">
            {showStars && (
                <>
                    <ShootingStars />
                    <StarsBackground />
                </>
            )}

            <main className="flex-1 w-full flex flex-col items-center">
                {children}
            </main>

            <LandingFooter />

            {/* Background Gradients/Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
}
