/**
 * GlobalBackground Component
 * Renders the user's global default background as a fixed backdrop.
 * Includes smooth cross-fade transitions for background changes.
 */
"use client";

import React from "react";
import { useActiveBackground } from "@/hooks/background";
import { cn } from "@/lib/utils";

interface GlobalBackgroundProps {
    className?: string;
    showStars?: boolean;
    position?: "fixed" | "absolute";
}

export const GlobalBackground: React.FC<GlobalBackgroundProps> = ({
    className,
    position = "fixed",
}) => {
    const { background, isLoading } = useActiveBackground();
    const [currentBg, setCurrentBg] = React.useState<string | null>(null);
    const [prevBg, setPrevBg] = React.useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = React.useState(false);

    // Handle background transitions
    React.useEffect(() => {
        if (background?.image?.url && background.image.url !== currentBg) {
            setPrevBg(currentBg);
            setCurrentBg(background.image.url);
            setIsTransitioning(true);

            // Allow time for the fade animation to complete
            const timer = setTimeout(() => setIsTransitioning(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [background?.image?.url]);

    const positionClass = position === "absolute" ? "absolute" : "fixed";

    if (isLoading || (!currentBg && !prevBg)) {
        return <div className={`${positionClass} inset-0 pointer-events-none z-0 bg-black`} />;
    }

    return (
        <div
            className={cn(
                `${positionClass} inset-0 pointer-events-none overflow-hidden z-0`,
                className
            )}
        >
            {/* Previous Background (fading out) */}
            {prevBg && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out scale-105"
                    style={{
                        backgroundImage: `url(${prevBg})`,
                        filter: "blur(6px) brightness(0.9) contrast(1.1)",
                        opacity: isTransitioning ? 1 : 0,
                    }}
                />
            )}

            {/* Current Background (fading in) */}
            {currentBg && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${currentBg})`,
                        filter: "blur(5px) brightness(0.4) contrast(1.1)",
                        opacity: isTransitioning ? (prevBg ? 0 : 1) : 1,
                    }}
                />
            )}

            {/* Overlay gradient to ensure content readability */}
            {/* <div className="absolute inset-0 bg-black/10" /> */}
        </div>
    );
};
