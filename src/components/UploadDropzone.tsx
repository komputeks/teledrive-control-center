import { DragEvent, useRef } from 'react';
import { FileUp, UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: FileList | null) => void;
}

export function UploadDropzone({ onFilesSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const prevent = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    prevent(event);
    onFilesSelected(event.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={prevent}
      onDragOver={prevent}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-8 text-center transition hover:bg-cyan-400/10"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <UploadCloud className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold text-white">Drag and drop files here</h3>
      <p className="mt-2 text-sm text-slate-400">Or click to choose files for browser-side staging before Telegram chunk upload.</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
        <FileUp className="h-3.5 w-3.5" /> Browser uploader
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFilesSelected(e.target.files)} />
    </div>
  );
}
