import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex flex-col bg-[#183640] px-8 py-8 text-white lg:px-14 lg:py-12">
        <Brand />
        <div className="my-auto max-w-lg py-16">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-300">Clear communication builds trust</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">Make complex legal processes easier to understand.</h1>
          <p className="mt-5 leading-7 text-slate-300">Create private, client-friendly visual drafts with a quality check built into every generation.</p>
        </div>
        <p className="text-xs leading-5 text-slate-400">AI output must be reviewed by a qualified legal professional.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">{children}</section>
    </main>
  );
}
