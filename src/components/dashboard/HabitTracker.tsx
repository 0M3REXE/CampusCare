import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HabitTracker({ loading = false }: { loading?: boolean }) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="45%" className="h-6" />
          <Skeleton variant="button" width="120px" />
        </div>
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton variant="text" width="70%" className="h-5 mb-2" />
                <Skeleton variant="text" width="90%" className="h-4" />
              </div>
              <Skeleton className="size-6 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const tasks = [
    {
      title: 'Morning run',
      time: '07:00',
      location: 'Campus loop',
      duration: '45 min',
      completed: true,
    },
    {
      title: 'Hydration check',
      time: 'Every 2 hours',
      location: 'Anywhere',
      duration: '2.0 L goal',
      completed: false,
    },
    {
      title: 'Prep balanced meals',
      time: '18:30',
      location: 'Residence kitchen',
      duration: '60 min',
      completed: false,
    },
  ];

  const completionRate = Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

  return (
    <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <ListChecks className="size-4" aria-hidden />
            Habits
          </div>
          <h3 className="text-lg font-semibold">Daily habit tracker</h3>
        </div>
        <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
          {completionRate}% complete
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700">
        Completing one more task moves you to the “consistent” streak tier.
      </div>

      <ul className="mt-4 space-y-3">
        {tasks.map((task) => {
          const Icon = task.completed ? CheckCircle2 : Circle;
          return (
            <li
              key={task.title}
              className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/70 p-4 shadow-sm transition hover:border-blue-500/30 dark:border-white/10 dark:bg-white/5"
            >
              <div className={`grid size-10 place-items-center rounded-lg ${task.completed ? 'bg-emerald-500/15 text-emerald-600' : 'bg-foreground/10 text-foreground/60'}`}>
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{task.title}</p>
                  <span className="text-xs font-medium text-foreground/50">{task.duration}</span>
                </div>
                <div className="mt-1 grid gap-1 text-xs text-foreground/60 md:grid-cols-2">
                  <span>Time • {task.time}</span>
                  <span>Location • {task.location}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
