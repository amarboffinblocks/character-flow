"use client";

import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useLogin } from "@/hooks/auth/use-login";
import { Loader2 } from "lucide-react";

const LoginForm = () => {
  const { login, isLoading, isSuccess } = useLogin({
    showToasts: true,
    redirectOnSuccess: true,
  });

  return (
    <div className="w-full max-w-xl relative z-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Instant access is enabled for this workspace.</p>
      </div>
      <Card className="px-6 py-8 text-center border-none bg-transparent backdrop-blur-none w-full space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Press the button below to enter the app. No account or password is required.
        </p>
        <Button
          type="button"
          className="w-full"
          disabled={isLoading || isSuccess}
          onClick={() => login()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </Card>
    </div>
  );
};

export default LoginForm;
