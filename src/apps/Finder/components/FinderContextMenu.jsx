import { Eye, Download, Edit, Copy, Scissors, Trash2, RotateCcw, X } from 'lucide-react';

export default function FinderContextMenu({
  contextMenu,
  setContextMenu,
  showTrash,
  handleItemDoubleClick,
  downloadFile,
  renameItem,
  copyItem,
  cutItem,
  moveToTrash,
  restoreItem,
  deleteItem
}) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-[#1e1e1f]/85 backdrop-blur-2xl rounded-lg shadow-2xl p-1 z-50 min-w-[180px] border border-white/10 select-none font-sans text-white text-[13px]"
      style={{
        left: Math.min(contextMenu.x, window.innerWidth - 200),
        top: Math.min(contextMenu.y, window.innerHeight - 300),
        zIndex: 99999
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {!showTrash ? (
        <>
          <button
            onClick={() => {
              handleItemDoubleClick(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center gap-2.5 transition-colors outline-none"
          >
            <Eye size={14} className="opacity-80" />
            <span>Open</span>
          </button>
          
          {contextMenu.item.type === 'file' && (
            <button
              onClick={() => {
                downloadFile(contextMenu.item);
                setContextMenu(null);
              }}
              className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center gap-2.5 transition-colors outline-none"
            >
              <Download size={14} className="opacity-80" />
              <span>Download</span>
            </button>
          )}

          <div className="h-px bg-white/10 my-1 mx-2"></div>

          <button
            onClick={() => {
              renameItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center gap-2.5 transition-colors outline-none"
          >
            <Edit size={14} className="opacity-80" />
            <span>Rename...</span>
          </button>
          
          <button
            onClick={() => {
              copyItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center justify-between gap-2.5 transition-colors outline-none"
          >
            <span className="flex items-center gap-2.5">
              <Copy size={14} className="opacity-80" />
              <span>Copy</span>
            </span>
            <span className="text-[10px] text-zinc-400">⌘C</span>
          </button>
          
          <button
            onClick={() => {
              cutItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center justify-between gap-2.5 transition-colors outline-none"
          >
            <span className="flex items-center gap-2.5">
              <Scissors size={14} className="opacity-80" />
              <span>Cut</span>
            </span>
            <span className="text-[10px] text-zinc-400">⌘X</span>
          </button>

          <div className="h-px bg-white/10 my-1 mx-2"></div>

          <button
            onClick={() => {
              moveToTrash(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-red-500/90 hover:text-white text-red-400 flex items-center gap-2.5 transition-colors outline-none"
          >
            <Trash2 size={14} />
            <span>Move to Trash</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              restoreItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-blue-650/90 text-[#f5f5f7] flex items-center gap-2.5 transition-colors outline-none"
          >
            <RotateCcw size={14} className="opacity-80" />
            <span>Restore</span>
          </button>
          
          <button
            onClick={() => {
              deleteItem(contextMenu.item);
              setContextMenu(null);
            }}
            className="w-full px-3 py-1 text-left rounded-[5px] cursor-default hover:bg-red-500/90 hover:text-white text-red-400 flex items-center gap-2.5 transition-colors outline-none"
          >
            <X size={14} />
            <span>Delete Permanently</span>
          </button>
        </>
      )}
    </div>
  );
}
