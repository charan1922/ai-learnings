'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
    >
      🖨️ Save as PDF
    </button>
  );
}
