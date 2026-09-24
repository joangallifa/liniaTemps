import { EntryForm } from "@/components/EntryForm";

export default function NovaEntradaPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Afegir una tecnologia
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Comparteix una tecnologia rellevant de la història amb la resta de la
        classe.
      </p>
      <EntryForm />
    </div>
  );
}
