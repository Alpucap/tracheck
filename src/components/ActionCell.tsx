"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Trash2, Edit, X } from "lucide-react";
import { deleteHabit, editHabit } from "@/app/action";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function ActionCell({ habitId, habitName }: { habitId: string; habitName: string }) {
    const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [isOpen, setIsOpen] = useState(false);
    const [newName, setNewName] = useState(habitName);

    const handleSave = async () => {
        if (!newName.trim() || newName === habitName) {
        setIsOpen(false);
        return;
        }
        const fd = new FormData();
        fd.append("habitId", habitId);
        fd.append("name", newName);
        await editHabit(fd);
        setIsOpen(false);
    };

    if (!isClient) return <div className="flex gap-3 justify-center w-12 opacity-0" />;

    const modalContent = (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border border-tracker-base">
            <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-tracker-dark">Edit Target</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
            </button>
            </div>
            <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border border-tracker-base rounded-md px-4 py-2 bg-tracker-bg mb-6 outline-none focus:ring-2 focus:ring-tracker-dark text-gray-800"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-md transition-colors">CANCEL</button>
            <button type="button" onClick={handleSave} className="bg-tracker-dark text-white px-6 py-2 rounded-md font-bold hover:bg-tracker-base transition-colors">SAVE</button>
            </div>
        </div>
        </div>
    );

    return (
        <>
        <div className="flex items-center justify-center gap-3">
            <button type="button" onClick={() => setIsOpen(true)} className="text-blue-400 hover:text-blue-600 active:scale-90 transition-colors">
            <Edit size={18} />
            </button>
            <form action={deleteHabit}>
            <input type="hidden" name="habitId" value={habitId} />
            <button type="submit" className="text-red-400 hover:text-red-600 active:scale-90 transition-colors">
                <Trash2 size={18} />
            </button>
            </form>
        </div>
        {isOpen && createPortal(modalContent, document.body)}
        </>
    );
}