import { PencilMascot } from "./PencilMascot";

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="Drawify Home">
      <PencilMascot className="h-10 w-10" />
      <span className="text-3xl font-bold font-headline tracking-tighter text-foreground">
        Drawify
      </span>
    </div>
  );
}
