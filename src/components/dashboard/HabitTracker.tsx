export default function HabitTracker() {
  const tasks = [
    { title: 'Morning run', time: '07:00 am', place: 'Park', dur: '45min', done: true },
    { title: '1,5L of water daily', time: 'All day', place: 'Park', done: false },
    { title: 'Cooking mealpreps for 3 days', time: '11:00 am', place: 'Home', dur: '2h', done: false },
  ];
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-background/60 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Habit tracker</h3>
        <div className="flex items-center gap-2 text-sm">
          <button className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Tasks</button>
          <button className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1">Habits</button>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-black/10 dark:divide-white/10">
        {tasks.map((t, i) => (
          <li key={i} className="flex items-center gap-3 py-3">
            <div className="size-12 rounded-xl bg-foreground/10" />
            <div className="flex-1">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-foreground/60 flex items-center gap-3">
                <span>⏰ {t.time}</span>
                <span className="size-1 rounded-full bg-foreground/40" />
                <span>📍 {t.place}</span>
                {t.dur && <>
                  <span className="size-1 rounded-full bg-foreground/40" />
                  <span>⌛ {t.dur}</span>
                </>}
              </div>
            </div>
            <input type="checkbox" className="size-5 accent-blue-600" defaultChecked={t.done} />
          </li>
        ))}
      </ul>
    </section>
  );
}
