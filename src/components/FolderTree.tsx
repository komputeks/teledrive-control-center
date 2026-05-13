import { ChevronRight, FolderTree as FolderTreeIcon } from 'lucide-react';

interface FolderNode {
  id: number;
  name: string;
  path: string;
  parent_path: string;
  item_count: number;
}

interface FolderTreeProps {
  folders: FolderNode[];
  selectedPath: string;
  onSelect: (path: string) => void;
}

export function FolderTree({ folders, selectedPath, onSelect }: FolderTreeProps) {
  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <button
          key={folder.id}
          onClick={() => onSelect(folder.path)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${selectedPath === folder.path ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
        >
          <div className="flex items-center gap-3">
            <FolderTreeIcon className="h-4 w-4 text-cyan-300" />
            <div>
              <div className="text-sm font-medium text-white">{folder.name}</div>
              <div className="text-xs text-slate-400">{folder.path}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{folder.item_count} items</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>
      ))}
    </div>
  );
}
