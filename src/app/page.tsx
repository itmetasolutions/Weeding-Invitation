import Link from "next/link";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import { COUPLE } from "@/data/wedding";

/**
 * Private host index. Guests receive the direct links below;
 * neither invitation links to or redirects to the other.
 */
export default function Home() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#14110e] px-6 font-cormorant text-[#efe6d6]">
      <div className="w-full max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-[#c5a46d]">Groom&apos;s family</p>
        <h1 className="mt-3 text-4xl italic">
          {COUPLE.groom} &amp; {COUPLE.bride}
        </h1>
        <p className="mt-3 text-lg opacity-70">Two separate invitations — send each guest the one they are invited to.</p>
        <div className="mt-10 grid gap-4">
          <Link href="/sehra-bandi-barat" className="block border border-[#c5a46d]/60 bg-[#0b1427] px-6 py-5 text-left transition hover:border-[#c5a46d]">
            <span className="block text-xs uppercase tracking-[0.3em] text-[#c5a46d]">Invitation 1 · 3 November</span>
            <span className="mt-1 block text-2xl">Sehra Bandi &amp; Barat</span>
            <span className="mt-1 block text-sm opacity-60">/sehra-bandi-barat</span>
          </Link>
          <Link href="/walima" className="block border border-[#c6a775]/60 bg-[#f8f4ec] px-6 py-5 text-left text-[#625349] transition hover:border-[#c6a775]">
            <span className="block text-xs uppercase tracking-[0.3em] text-[#a88a56]">Invitation 2 · 4 November</span>
            <span className="mt-1 block text-2xl">Walima Reception</span>
            <span className="mt-1 block text-sm opacity-60">/walima</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
