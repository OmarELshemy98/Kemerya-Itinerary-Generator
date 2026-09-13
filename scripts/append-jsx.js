const fs = require('fs');
const path = 'd:/Kemerya-Itinerary-Generator/src/components/pdf/pdf-preview-dialog.tsx';

const jsxPart = `  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col h-[80vh]">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-[#C9A962]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">
                PDF Preview
                {languageCode && <span className="ml-2 text-sm font-normal text-slate-500">({languageCode})</span>}
              </h2>
            </div>
            <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 bg-slate-100">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#C9A962] border-t-transparent" />
                  <p className="mt-4 text-sm text-slate-600">Generating PDF preview...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm p-6">
                  <svg className="h-16 w-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="mt-4 text-sm text-red-600">{error}</p>
                  <button onClick={() => onOpenChange(false)} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#C9A962] rounded-lg hover:bg-[#b89555]">Close</button>
                </div>
              </div>
            ) : pdfUrl ? (
              <iframe title="PDF Preview" className="w-full h-full bg-white" src={pdfUrl} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500">No PDF to display</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500 text-center">
              {languageCode ? "PDF translated to " + languageCode + ". Click Download to save." : "Click Download PDF to save the full-quality document."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
`;

fs.appendFileSync(path, jsxPart, 'utf8');
console.log('JSX appended');
