'use client';

import { useState } from 'react';

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open user manual"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-blue-200 transition-transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.524 0 4.848a3.632 3.632 0 01-.887.6c-.312.163-.455.39-.455.573V13.5a.75.75 0 01-1.5 0v-.574c0-.812.57-1.468 1.102-1.745a2.13 2.13 0 00.52-.352c.566-.495.566-1.302 0-1.796zM12 17.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Modal backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Modal panel */}
          <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-blue-600 px-5 py-3">
              <div className="flex items-center gap-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.524 0 4.848a3.632 3.632 0 01-.887.6c-.312.163-.455.39-.455.573V13.5a.75.75 0 01-1.5 0v-.574c0-.812.57-1.468 1.102-1.745a2.13 2.13 0 00.52-.352c.566-.495.566-1.302 0-1.796zM12 17.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">User Manual</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/user-manual.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-100 ring-1 ring-blue-400 transition hover:bg-blue-500"
                >
                  Open in new tab ↗
                </a>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close manual"
                  className="rounded-lg p-1.5 text-blue-100 transition hover:bg-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              src="/user-manual.html"
              title="User Manual"
              className="flex-1 border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
