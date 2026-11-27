import Link from "next/link";
import { FolderOpen, LogOut, Plus } from "lucide-react";
import { Brand } from "./brand";
import { signOut } from "@/app/(auth)/actions";

export function AppShell({ children, email }: { children: React.ReactNode; email: string }) {
  return (
    <div className="min-h-screen bg-[#f8f7f3]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Brand href="/dashboard" />
          <div className="flex items-center gap-2">
            <Link href="/projects/new" className="button-primary"><Plus className="size-4" /><span className="hidden sm:inline">New project</span></Link>
            <details className="relative">
              <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-stone-200 bg-stone-50 text-sm font-semibold uppercase text-slate-700">{email.slice(0, 1)}</summary>
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-2 shadow-xl">
                <p className="truncate px-3 py-2 text-xs text-slate-500">{email}</p>
                <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-stone-50"><FolderOpen className="size-4" /> Projects</Link>
                <form action={signOut}><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-50"><LogOut className="size-4" /> Sign out</button></form>
              </div>
            </details>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
