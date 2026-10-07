"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SutraStudioIntroLanding } from "@/components/motion/SutraStudioIntroLanding";

export default function LandingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      <SutraStudioIntroLanding alwaysShow={true} onComplete={handleComplete} />
    </div>
  );
}
