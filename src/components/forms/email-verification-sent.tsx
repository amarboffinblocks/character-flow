"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface EmailVerificationSentProps {
    email?: string;
}

const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

const EmailVerificationSent: React.FC<EmailVerificationSentProps> = ({ email }) => {
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="w-full max-w-lg">
                {/* Logo Section */}
                <div className="relative w-full h-50 ">
                    <Image
                        src="/logo/logo.png"
                        alt="universe-logo"
                        fill
                        priority
                        className="object-contain"
                    />
                </div>

                <Card className="px-6 py-8 text-center border-none bg-transparent backdrop-blur-none w-full space-y-4">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex flex-col items-center space-y-5"
                    >
                        {/* Content Section */}
                        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                {/* Animated Pulse Halo */}
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative rounded-full bg-primary/10 border border-primary/20 p-4">
                                    <Mail className="h-10 w-10 text-primary drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)]" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-white tracking-tight italic">
                                    Check Your Email
                                </h2>
                                <p className="text-[13px] text-muted-foreground/80 leading-snug">
                                    We&apos;ve sent a verification link to your inbox.
                                </p>
                            </div>

                            {/* Recipient Display */}
                            {email && (
                                <div className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 max-w-full">
                                    <p className="text-[14px] font-medium text-primary/90 truncate max-w-[240px]">
                                        {email}
                                    </p>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="space-y-2">
                                <p className="text-[13px] text-muted-foreground leading-relaxed px-2">
                                    Please click the link in the email to activate your account.
                                </p>
                                <div className="text-[11px] text-muted-foreground/50 italic px-4 leading-tight">
                                    Links expire in 24 hours. Check your spam folder if missing.
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Section */}
                        <motion.div variants={itemVariants} className="w-full space-y-3 pt-2">
                            <Link href="/resend/verification-email" className="block w-full">
                                <Button
                                    className="w-full h-10 bg-primary hover:bg-accent-hover text-primary-foreground font-medium"
                                >
                                    <Mail className="mr-2 h-4 w-4" />
                                    Resend Verification Email
                                </Button>
                            </Link>

                            <Link href="/sign-in" className="block w-full">
                                <Button
                                    variant="ghost"
                                    className="w-full h-10"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Sign In
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Footer / Help */}
                        <motion.div variants={itemVariants} className="pt-2 w-full flex justify-center">
                            <p className="text-xs text-muted-foreground">
                                Need help? <Link href="/support" className="text-primary underline hover:text-primary/80">Contact Support</Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </Card>
            </div>
        </div>
    );
};

export default EmailVerificationSent;

