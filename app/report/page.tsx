import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import PrintButton from './print-button';

export default async function ReportPage() {
  const filePath = path.join(process.cwd(), 'public', 'northstar-clinical-intelligence-report.md');
  const markdown = await readFile(filePath, 'utf-8');
  const html = await marked(markdown, { gfm: true });

  return (
    <>
      {/* Print styles — hides toolbar when printing */}
      <style>{`
        @media print {
          #report-toolbar { display: none !important; }
          body { background: white !important; }
          .prose { max-width: 100% !important; padding: 0 !important; }
        }
        .prose table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .prose th, .prose td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; }
        .prose th { background: #f9fafb; font-weight: 600; }
        .prose tr:nth-child(even) td { background: #f9fafb; }
        .prose blockquote { border-left: 4px solid #d1d5db; padding-left: 1rem; color: #6b7280; margin: 1rem 0; font-style: italic; }
        .prose code:not(pre code) { background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875em; }
        .prose pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .prose pre code { background: transparent; padding: 0; }
        .prose hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
      `}</style>

      {/* Sticky toolbar */}
      <div id="report-toolbar" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-white/90 dark:bg-background/90 backdrop-blur border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">NorthStar Clinical Intelligence Report</span>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-muted">INTERNAL — CONFIDENTIAL</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/vector-db/demo"
            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            ← Back to Demo
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Document body */}
      <div className="pt-16 pb-16 bg-white dark:bg-background min-h-screen">
        <div
          className="prose prose-sm sm:prose max-w-4xl mx-auto px-8 py-8
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3 prose-h1:mb-6
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-sm prose-p:leading-relaxed prose-p:text-gray-700
            prose-li:text-sm prose-li:text-gray-700
            prose-strong:font-semibold
            dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}
