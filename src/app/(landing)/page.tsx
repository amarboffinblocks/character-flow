import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Component } from "@/components/ui/etheral-shadow";

export default function Home() {
  return (
    <Component
      color="rgba(128, 128, 128, 1)"
      animation={{ scale: 100, speed: 90 }}
      noise={{ opacity: 1, scale: 1.2 }}
      sizing="fill"
    >
      <div className="relative z-10 mx-auto flex w-full h-screen max-w-5xl    flex-col items-center justify-center text-center ">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border  px-3 py-1 text-xs font-medium tracking-wide text-gray-200">
          Character Flow Platform
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Create Characters and Start Amazing Stories
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
          Build your characters, shape your world, and chat in a fun and easy
          way. Everything you need is in one simple place.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
          // className="h-12 rounded-full bg-white px-7 text-black hover:bg-gray-200"
          >
            <Link href="/sign-in">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
          // className="h-12 rounded-full border-white/20 bg-transparent px-7 text-white hover:bg-white/10"
          >
            <Link href="/sign-in">
              Try It Now
              <PlayCircle className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-400 sm:text-sm">
          Designed for storytellers, roleplay creators, and worldbuilders.
        </p>
      </div>
    </Component>

  );
}
