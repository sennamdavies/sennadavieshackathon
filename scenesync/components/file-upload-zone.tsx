"use client";

import { FileText, UploadCloud } from "lucide-react";
import { useRef } from "react";

type FileUploadZoneProps = {
  isBusy: boolean;
  selectedFileName?: string;
  onFileSelected: (file: File) => void;
};

/**
 * Drag-and-click upload surface for screenplay files.
 *
 * Args:
 *   isBusy: Whether the app is currently analyzing a script.
 *   selectedFileName: Optional selected file name shown back to the user.
 *   onFileSelected: Callback invoked when the user picks a valid file.
 *
 * Returns:
 *   A studio-styled upload card.
 */
export function FileUploadZone({
  isBusy,
  selectedFileName,
  onFileSelected,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (isBusy) {
      return;
    }

    const file = files?.[0];

    if (!file) {
      return;
    }

    onFileSelected(file);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm">
      <div
        className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition-colors ${
          isBusy
            ? "cursor-not-allowed opacity-70"
            : "cursor-pointer hover:border-slate-400 hover:bg-slate-100"
        }`}
        onClick={() => {
          if (!isBusy) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
      >
        <div className="mb-4 rounded-full bg-slate-900 p-3 text-white">
          <UploadCloud className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold text-slate-950">
          Upload a screenplay
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Drop a `.txt` or `.fountain` file here, or click to browse. SceneSync
          will split the script into scenes and build a smart breakdown for each
          one.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
          <FileText className="h-4 w-4" />
          {selectedFileName ?? "No script selected yet"}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".txt,.fountain,text/plain"
        disabled={isBusy}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
