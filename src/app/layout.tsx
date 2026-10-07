import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/mulish/400.css";
import "@fontsource/mulish/500.css";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/700.css";
import "@fontsource/mulish/800.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "De la señal a la decisión · Agenda de investigación TVN",
  description: "Prototipo para TVN Media · hackIAthon. Copiloto de inteligencia informativa para la mesa editorial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="bg-indigo text-sobre-indigo">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
            <Link href="/" className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-rotulo text-lg font-black uppercase tracking-tight">De la señal a la decisión</span>
              <span className="rounded-sm bg-amarillo px-2 py-0.5 text-xs font-extrabold text-indigo">Prototipo para TVN Media · hackIAthon</span>
            </Link>
            <nav className="-mx-3 flex flex-wrap items-center gap-1 text-sm font-semibold">
              <Link href="/" className="rounded px-3 py-1.5 text-sobre-indigo-2 hover:bg-indigo-2 hover:text-sobre-indigo">Agenda de investigación</Link>
              <Link href="/consulta" className="rounded px-3 py-1.5 text-sobre-indigo-2 hover:bg-indigo-2 hover:text-sobre-indigo">Consultar el corpus</Link>
              <a href="/api/fichas" className="rounded px-3 py-1.5 text-sobre-indigo-2 hover:bg-indigo-2 hover:text-sobre-indigo">Exportar fichas.jsonl</a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-indigo py-4 text-center text-sm text-sobre-indigo-2">
          Borradores para revisión humana · el sistema nunca publica · funciona sin conexión con el snapshot del equipo
        </footer>
      </body>
    </html>
  );
}
