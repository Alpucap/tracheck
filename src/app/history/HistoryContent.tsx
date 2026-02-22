"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import ExportButton from "@/components/ExportButton";

interface HistoryContentProps {
    view: string;
    misses: { name: string; count: number }[];
    flatData: { Date: string; Target: string; Status: string }[];
}

export default function HistoryContent({ view, misses, flatData }: HistoryContentProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const MASTER_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD; 

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === MASTER_PASSWORD) {
        setIsAuthenticated(true);
        setError(false);
        } else {
        setError(true);
        }
    };

    if (!isAuthenticated) {
        return (
        <main className="min-h-screen flex items-center justify-center bg-tracker-bg p-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-tracker-base w-full max-w-md text-center">
            <div className="bg-tracker-light/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-tracker-dark" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-tracker-dark mb-2">Admin Access</h1>
            <p className="text-sm text-gray-500 mb-6">Masukkan password untuk mengakses history.</p>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                type="password"
                placeholder="Password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 rounded-md border ${error ? 'border-red-500' : 'border-tracker-base'} outline-none focus:ring-2 focus:ring-tracker-dark text-center`}
                autoFocus
                />
                {error && <p className="text-xs text-red-500 font-bold italic">Password salah!</p>}
                <button type="submit" className="w-full bg-tracker-dark text-white py-3 rounded-md font-bold hover:bg-tracker-base transition-all active:scale-95 shadow-md uppercase">
                Unlock History
                </button>
                <Link href="/" className="block text-sm text-gray-400 hover:text-tracker-dark pt-2">← Kembali</Link>
            </form>
            </div>
        </main>
        );
    }

    return (
        <main suppressHydrationWarning className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-tracker-light">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
                <Link href="/" className="text-tracker-dark flex items-center gap-2 mb-2 font-medium hover:underline">
                <ArrowLeft size={18} /> Dashboard
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-tracker-dark">Administrative History</h1>
            </div>
            <div className="w-full sm:w-auto">
                <ExportButton historyData={flatData} missedSummary={misses} />
            </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-tracker-bg p-4 rounded-lg border border-tracker-base">
            <div className="flex flex-wrap gap-2 items-center">
                {['week', 'month', 'year', 'all'].map(v => (
                <Link 
                    key={v} 
                    href={`/history?view=${v}`} 
                    className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    view === v ? 'bg-tracker-dark text-white shadow-md' : 'bg-white border border-tracker-base text-tracker-dark hover:bg-tracker-light'
                    }`}
                >
                    {v.toUpperCase()}
                </Link>
                ))}
            </div>

            <form className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end flex-1">
                <div className="flex-1">
                <label className="block text-[10px] font-bold text-tracker-dark mb-1 uppercase tracking-wider">From</label>
                <input type="date" name="from" className="w-full text-sm p-2 rounded border border-tracker-base outline-none focus:ring-2 focus:ring-tracker-dark bg-white" />
                </div>
                <div className="flex-1">
                <label className="block text-[10px] font-bold text-tracker-dark mb-1 uppercase tracking-wider">To</label>
                <input type="date" name="to" className="w-full text-sm p-2 rounded border border-tracker-base outline-none focus:ring-2 focus:ring-tracker-dark bg-white" />
                </div>
                <button type="submit" className="bg-tracker-dark text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-tracker-base transition-colors active:scale-95 uppercase">Filter</button>
            </form>
            </div>

            <h2 className="text-lg font-bold text-tracker-dark mb-4">Missed Per Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {misses.map((m, i) => (
                <div key={i} className="bg-white border border-tracker-base p-4 rounded-md flex justify-between items-center shadow-sm">
                <span className="truncate pr-2 font-semibold text-gray-700">{m.name}</span>
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 whitespace-nowrap">{m.count} Miss</span>
                </div>
            ))}
            </div>

            <h2 className="text-lg font-bold text-tracker-dark mb-4">Detailed Logs</h2>
            <div className="rounded-lg border border-tracker-base overflow-hidden">
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-tracker-bg sticky top-0 z-10 shadow-sm">
                    <tr>
                    <th className="p-4 text-tracker-dark font-bold border-b border-tracker-base">Date</th>
                    <th className="p-4 text-tracker-dark font-bold border-b border-tracker-base">Target</th>
                    <th className="p-4 text-tracker-dark font-bold border-b border-tracker-base text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-tracker-bg">
                    {flatData.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors group">
                        <td className="p-4 text-gray-600 whitespace-nowrap">{r.Date}</td>
                        <td className="p-4 font-medium text-gray-800">{r.Target}</td>
                        <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${
                            r.Status === 'Done' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                            {r.Status}
                        </span>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </main>
    );
}