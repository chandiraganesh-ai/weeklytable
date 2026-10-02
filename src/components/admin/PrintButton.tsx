"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
    >
      Print
    </button>
  );
}
