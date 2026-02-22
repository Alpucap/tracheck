"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addHabit(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name) return;
    await prisma.habit.create({ data: { name } });
    revalidatePath("/");
    revalidatePath("/history");
}

export async function editHabit(formData: FormData) {
    const habitId = formData.get("habitId") as string;
    const name = formData.get("name") as string;
    if (!name || !habitId) return;
    await prisma.habit.update({ where: { habitId }, data: { name } });
    revalidatePath("/");
    revalidatePath("/history");
}

export async function deleteHabit(formData: FormData) {
    const habitId = formData.get("habitId") as string;
    await prisma.habit.delete({ where: { habitId } });
    revalidatePath("/");
    revalidatePath("/history");
}

export async function toggleHabitLog(formData: FormData) {
    const habitId = formData.get("habitId") as string;
    const dateStr = formData.get("dateStr") as string;
    const completed = formData.get("completed") === "true";
    const date = new Date(`${dateStr}T00:00:00Z`);

    await prisma.habitLog.upsert({
        where: { habitId_date: { habitId, date } },
        update: { completed },
        create: { habitId, date, completed },
    });
    revalidatePath("/");
    revalidatePath("/history");
}