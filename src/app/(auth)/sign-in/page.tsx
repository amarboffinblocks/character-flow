import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "@/components/forms/login-form";
import Container from "@/components/elements/container";
import { Component } from "@/components/ui/etheral-shadow";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <Component
      color="rgba(128, 128, 128, 1)"
      animation={{ scale: 100, speed: 90 }}
      noise={{ opacity: 1, scale: 1.2 }}
      sizing="fill"
    >
      <Container className="relative h-full">
        <div className="absolute top-4 left-4 z-10">
          <Button asChild variant="outline" >
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
        <div className="flex justify-center items-center h-full">
          <Suspense fallback={<div className="text-muted-foreground text-sm">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </Component>
  );
}
