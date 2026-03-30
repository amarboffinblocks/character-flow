"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import YourUniverse from "../icons/your-universe";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
    { name: "About", href: "/#about" },
    { name: "Blog", href: "/#blog" },
    { name: "Character Market", href: "/#market" },
];

import { usePathname, useRouter } from "next/navigation";

interface LandingHeaderProps {
    simple?: boolean;
}

export default function LandingHeader({ simple = false }: LandingHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Automatically be simple if not on the home page, unless explicitly simple already
    const isSimple = simple || pathname !== "/";

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // Only handle smooth scroll if we are on the home page and the link is an anchor link
        if (pathname === "/" && href.startsWith("/#")) {
            e.preventDefault();
            const targetId = href.replace("/#", "");
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                setIsOpen(false);
            }
        }
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-4 py-6 md:px-8 bg-transparent backdrop-blur-none">
            {/* <EnquiryModal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} /> */}

            <div className="mx-auto max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative h-15 w-15 transition-transform duration-300 group-hover:scale-110 text-white">
                        <YourUniverse />
                    </div>
                    <span className="text-lg font-bold text-white tracking-wide">
                        YourUniverse.AI
                    </span>
                </Link>

                {/* Desktop Navigation - Hidden if simple */}
                {!isSimple && (
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-sm font-medium text-gray-300 transition-colors hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Right Actions */}
                <div className="hidden lg:flex items-center gap-6">

                    {!isSimple && (
                        <Link
                            href="/sign-in"
                            className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                        >
                            <Button
                                // onClick={() => setIsEnquiryOpen(true)}
                                className="relative overflow-hidden rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-2 font-medium text-white shadow-[0_0_15px_rgba(85,46,251,0.4)] transition-all hover:shadow-[0_0_25px_rgba(85,46,251,0.6)] hover:scale-105"
                            >
                                Enter Your Universe
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Mobile Navigation Toggle - Only show if not simple? Or just show simpler menu? 
                    If simple, maybe no mobile menu needed if only Login exists? 
                    But let's hide it for simple mode as requested "just logo and login" */}
                {!isSimple && (
                    <div className="lg:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                )}

                {/* Simple mobile explicit login if needed? 
                    For simple mode on mobile, we might want to show Login link/button.
                    Currently "Right Actions" is hidden on lg.
                    Let's add a visible Login for mobile in simple mode.
                 */}
                {isSimple && (
                    <div className="lg:hidden flex items-center">
                        <Link
                            href="/sign-in"
                            className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                        >
                            Login
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isOpen && !isSimple && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-20 left-4 right-4 z-40 lg:hidden"
                    >
                        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-6 backdrop-blur-xl shadow-2xl">
                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => {
                                            setIsOpen(false);
                                            handleNavClick(e, link.href);
                                        }}
                                        className="text-lg font-medium text-gray-300 transition-colors hover:text-white"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                <hr className="border-white/10 my-2" />
                                <Link
                                    href="/sign-in"
                                    onClick={() => setIsOpen(false)}
                                    className="text-lg font-medium text-gray-300 transition-colors hover:text-white"
                                >
                                    Login
                                </Link>
                                <Button
                                    className="w-full rounded-xl bg-linear-to-r from-blue-600 to-purple-600 py-6 text-lg font-bold text-white shadow-lg"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsEnquiryOpen(true);
                                    }}
                                >
                                    Enter Your Universe
                                </Button>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
