'use client'
import { Pencil } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-primary">
      <Pencil className="h-12 w-12 animate-spin" />
      <p className="font-semibold text-muted-foreground">AI is busy drawing...</p>
    </div>
  );
}
