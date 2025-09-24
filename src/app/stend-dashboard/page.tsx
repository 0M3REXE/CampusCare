"use client";
import WellnessBoard from "@/components/WellnessBoard";

export default function StendDashboardPage() {
  return (
    <div className="px-0 sm:px-0 py-6">
      {/* Full-bleed container so the frame isn't constrained by max-w */}
      <div className="w-full">
        <WellnessBoard />
      </div>
    </div>
  );
}
