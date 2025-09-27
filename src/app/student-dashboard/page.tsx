"use client";
import Filters from "@/components/dashboard/Filters";
import NutritionCard from "@/components/dashboard/NutritionCard";
import ActivityWidget from "@/components/dashboard/ActivityWidget";
import HabitTracker from "@/components/dashboard/HabitTracker";
import DailyProgress from "@/components/dashboard/DailyProgress";
import MeditationCard from "@/components/dashboard/MeditationCard";

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50/40 py-10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto w-full max-w-[1280px] space-y-8 px-4">
  <Filters />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <NutritionCard />
          </div>
          <div className="col-span-12 lg:col-span-5 xl:col-span-4">
            <ActivityWidget />
          </div>

          <div className="col-span-12 lg:col-span-7 xl:col-span-5">
            <HabitTracker />
          </div>
          <div className="col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-3">
            <DailyProgress />
          </div>
          <div className="col-span-12 md:col-span-6 xl:col-span-4">
            <MeditationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
