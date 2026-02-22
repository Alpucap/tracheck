import { prisma } from "@/lib/prisma";
import { addDays, format, differenceInDays, startOfDay, subDays } from "date-fns";
import HistoryContent from "./HistoryContent";

interface HabitLog {
    date: Date | string;
    completed: boolean;
}

interface HabitWithLogs {
    name: string;
    createdAt: Date;
    logs: HabitLog[];
}

type Props = {
    searchParams: Promise<{ view?: string; from?: string; to?: string }>;
};

export default async function HistoryPage({ searchParams }: Props) {
    const resolvedParams = await searchParams;
    const view = resolvedParams.view || 'month';
    
    const data = await prisma.habit.findMany({ 
        include: { logs: true }, 
        orderBy: { createdAt: 'asc' } 
    });

    const habits = data as unknown as HabitWithLogs[];
    const today = startOfDay(new Date());

    const allLogDates = habits.flatMap((h) => h.logs.map(l => new Date(l.date)));
    const furthestLogDate = allLogDates.length > 0 
        ? startOfDay(new Date(Math.max(...allLogDates.map(d => d.getTime()))))
        : today;

    const endDate = resolvedParams.to ? startOfDay(new Date(resolvedParams.to)) : furthestLogDate;

    let startDate = resolvedParams.from 
        ? startOfDay(new Date(resolvedParams.from)) 
        : subDays(today, view === 'week' ? 6 : view === 'year' ? 364 : 29);

    if (view === 'all' && habits[0]) {
        startDate = startOfDay(habits[0].createdAt);
    }

    const rangeCount = Math.max(0, differenceInDays(endDate, startDate) + 1);
    const displayDates = Array.from({ length: rangeCount }).map((_, i) => format(addDays(startDate, i), 'yyyy-MM-dd'));

    const misses = habits.map((h) => ({
        name: h.name,
        count: displayDates.filter(d => !h.logs.find(l => format(new Date(l.date), 'yyyy-MM-dd') === d && l.completed)).length
    })).sort((a, b) => b.count - a.count);

    const flatData = habits.flatMap((h) => displayDates.map(d => ({
        Date: d, 
        Target: h.name, 
        Status: h.logs.find(l => format(new Date(l.date), 'yyyy-MM-dd') === d && l.completed) ? 'Done' : 'Missed'
    }))).sort((a, b) => b.Date.localeCompare(a.Date));

    return <HistoryContent view={view} misses={misses} flatData={flatData} />;
}