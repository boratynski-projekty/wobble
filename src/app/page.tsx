import { TowerPreview } from "@/components/tower-preview";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Wobble</h1>
        <p className="text-muted text-balance">
          Twoje zadania to klocki w chwiejnej wieży. Rano stoi pełna, wieczorem
          powinna być rozebrana.
        </p>
      </div>

      <TowerPreview />

      <p className="text-muted text-center text-sm">
        Faza 0 — szkielet projektu. Mechanika wieży powstaje w fazie 2.
      </p>
    </main>
  );
}
