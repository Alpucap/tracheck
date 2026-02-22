import { prisma } from "@/lib/prisma";
import { addHabit, toggleHabitLog } from "./action";
import { addDays, format, differenceInDays, startOfDay, subDays } from "date-fns";
import { Check, History, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ActionCell from "@/components/ActionCell";

type Props = {
  searchParams: Promise<{ view?: string; offset?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const view = resolvedParams.view || 'month';
  const offset = parseInt(resolvedParams.offset || '0', 10);

  const habits = await prisma.habit.findMany({
    include: { logs: true },
    orderBy: { createdAt: 'asc' }
  });

  const today = startOfDay(new Date());
  let startDate = addDays(today, offset);
  let daysCount = 30;

  if (view === 'week') daysCount = 7;
  else if (view === 'year') daysCount = 365;
  else if (view === 'all' && habits[0]) {
    startDate = startOfDay(habits[0].createdAt);
    daysCount = Math.max(differenceInDays(addDays(today, 30), startDate) + 1, 30);
  }

  const displayDates = Array.from({ length: daysCount }).map((_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));

  let currentStreak = 0;
  const habitsCount = habits.length;

  if (habitsCount > 0) {
    const isMet = (date: Date) => {
      const dStr = format(date, 'yyyy-MM-dd');
      const count = habits.filter(h => h.logs.some(l => format(new Date(l.date), 'yyyy-MM-dd') === dStr && l.completed)).length;
      return count >= Math.ceil(habitsCount / 2);
    };

    if (isMet(today)) {
      currentStreak = 1;
      let f = addDays(today, 1);
      while (isMet(f)) { currentStreak++; f = addDays(f, 1); }
      let b = subDays(today, 1);
      while (isMet(b)) { currentStreak++; b = subDays(b, 1); }
    } else {
      let b = subDays(today, 1);
      while (isMet(b)) { currentStreak++; b = subDays(b, 1); }
    }
  }

  return (
    <main suppressHydrationWarning className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-tracker-light">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-tracker-dark">Tracker Dashboard</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none bg-tracker-light/30 border border-tracker-base text-tracker-dark px-4 py-2 rounded-md font-bold text-xs sm:text-sm text-center">
              Current Streak: {currentStreak} Days
            </div>
            <Link href="/history" className="bg-tracker-bg border border-tracker-base p-2 rounded-md hover:bg-tracker-light transition-colors">
              <History size={18} className="text-tracker-dark" />
            </Link>
          </div>
        </div>
        
        <form action={addHabit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" name="name" placeholder="New target..." className="flex-1 border border-tracker-base rounded-md px-4 py-2 bg-tracker-bg outline-none text-sm" required />
          <button type="submit" className="bg-tracker-dark text-white px-6 py-2 rounded-md font-bold active:scale-95 transition-all text-sm uppercase">Add Target</button>
        </form>

        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
          <div className="grid grid-cols-4 sm:flex gap-2">
            {['week', 'month', 'year', 'all'].map((v) => (
              <Link key={v} href={`/?view=${v}&offset=0`} className={`px-2 sm:px-4 py-2 rounded-md text-[10px] sm:text-sm font-bold border text-center transition-all ${view === v ? 'bg-tracker-dark text-white shadow-md' : 'bg-tracker-bg text-tracker-dark border-tracker-base hover:bg-tracker-light'}`}>
                {v.toUpperCase()}
              </Link>
            ))}
          </div>
          {view !== 'all' && (
            <div className="flex items-center justify-between sm:justify-end gap-1 bg-tracker-bg rounded-md p-1 border border-tracker-base">
              <Link href={`/?view=${view}&offset=${offset - daysCount}`} className="p-1.5 hover:bg-tracker-light rounded text-tracker-dark"><ChevronLeft size={18} /></Link>
              <Link href={`/?view=${view}&offset=0`} className="px-4 py-1.5 hover:bg-tracker-light rounded text-tracker-dark font-black text-[10px] tracking-widest uppercase">Today</Link>
              <Link href={`/?view=${view}&offset=${offset + daysCount}`} className="p-1.5 hover:bg-tracker-light rounded text-tracker-dark"><ChevronRight size={18} /></Link>
            </div>
          )}
        </div>

        <div className="relative w-full overflow-x-auto rounded-lg border border-tracker-bg pb-2">
          <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="py-4 px-4 font-bold text-tracker-dark min-w-37.5 md:min-w-62.5 sticky left-0 z-20 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs sm:text-sm uppercase tracking-tighter">Target</th>
                {displayDates.map((dateStr) => (
                  <th key={dateStr} className={`px-2 py-3 text-center text-[10px] sm:text-xs min-w-12 ${dateStr === format(today, 'yyyy-MM-dd') ? 'text-tracker-dark font-black bg-tracker-bg/50' : 'text-gray-400 font-medium'}`}>
                    <div className="flex flex-col items-center">
                      <span className="uppercase">{format(new Date(dateStr), 'MMM')}</span>
                      <span className="text-sm">{format(new Date(dateStr), 'dd')}</span>
                    </div>
                  </th>
                ))}
                <th className="py-4 px-4 font-bold text-tracker-dark text-center sticky right-0 z-20 bg-white shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs sm:text-sm uppercase tracking-tighter">Action</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.habitId} className="border-t border-tracker-bg hover:bg-gray-50 group">
                  <td className="py-4 px-4 font-semibold text-gray-700 sticky left-0 z-10 bg-white group-hover:bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] max-w-37.5 md:max-w-62.5 truncate text-xs sm:text-sm">{habit.name}</td>
                  {displayDates.map((dateStr) => {
                    const isDone = habit.logs.some(l => format(new Date(l.date), 'yyyy-MM-dd') === dateStr && l.completed);
                    return (
                      <td key={dateStr} className={`px-2 py-3 text-center ${dateStr === format(today, 'yyyy-MM-dd') ? 'bg-tracker-bg/30' : ''}`}>
                        <form action={toggleHabitLog}>
                          <input type="hidden" name="habitId" value={habit.habitId} /><input type="hidden" name="dateStr" value={dateStr} /><input type="hidden" name="completed" value={String(!isDone)} />
                          <button 
                            type="submit" 
                            suppressHydrationWarning
                            className={`w-8 h-8 rounded flex items-center justify-center transition-all duration-300 mx-auto active:scale-75 shadow-sm ${isDone ? 'bg-tracker-dark scale-110' : 'bg-tracker-bg border border-tracker-base hover:bg-tracker-light'}`}
                          >
                            {isDone && <Check size={18} strokeWidth={4} className="text-white drop-shadow-md" />}
                          </button>
                        </form>
                      </td>
                    );
                  })}
                  <td className="py-4 px-4 text-center sticky right-0 z-10 bg-white group-hover:bg-gray-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <ActionCell habitId={habit.habitId} habitName={habit.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}