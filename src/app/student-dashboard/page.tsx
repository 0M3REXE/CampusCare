"use client";
import HeaderBar from "@/components/dashboard/HeaderBar";
import Filters from "@/components/dashboard/Filters";
import NutritionCard from "@/components/dashboard/NutritionCard";
import ActivityWidget from "@/components/dashboard/ActivityWidget";
import HabitTracker from "@/components/dashboard/HabitTracker";
import DailyProgress from "@/components/dashboard/DailyProgress";
import MeditationCard from "@/components/dashboard/MeditationCard";

export default function StudentDashboardPage() {
  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto py-6">
        <div className="mx-auto w-[1344px] max-w-none px-4 space-y-6">
          <HeaderBar />
          <Filters />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <NutritionCard />
            </div>
            <div className="col-span-4">
              <ActivityWidget />
            </div>
            <div className="col-span-5">
              <HabitTracker />
            </div>
            <div className="col-span-3">
              <DailyProgress />
            </div>
            <div className="col-span-4">
              <MeditationCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
