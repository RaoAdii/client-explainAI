import Link from "next/link";
import { Scale } from "lucide-react";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-slate-900">
      <span className="grid size-9 place-items-center rounded-lg bg-[#183640] text-white"><Scale className="size-5" /></span>
      <span>ClientExplain <span className="text-[#a9681d]">AI</span></span>
    </Link>
  );
}
