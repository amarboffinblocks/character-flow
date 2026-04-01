"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 2000);
    };

    return (
        
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:min-w-[325px]  bg-[#0F111A] rounded-4xl border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Contact the Team</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Interested in creating your own universe? Leave us a message.
                    </DialogDescription>
                </DialogHeader>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-300">Name</Label>
                            <Input
                                id="name"
                                required
                                placeholder="Your name"
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-gray-300">Enquiry</Label>
                            <Textarea
                                id="message"
                                required
                                placeholder="Tell us what you're looking for..."
                                className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 min-h-[100px]"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium"
                        >
                            {loading ? "Sending..." : "Send Enquiry"}
                        </Button>
                    </form>
                ) : (
                    <div className="py-8 text-center space-y-3">
                        <div className="text-4xl">✨</div>
                        <h3 className="text-lg font-bold text-white">Message Sent!</h3>
                        <p className="text-gray-400">We'll get back to you shortly.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
