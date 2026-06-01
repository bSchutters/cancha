import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-6">
      <h1 className="text-6xl font-marjorie font-bold italic text-primary">404</h1>
      <p className="text-xl">Page non trouvée</p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-md hover:opacity-80 transition-all"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
