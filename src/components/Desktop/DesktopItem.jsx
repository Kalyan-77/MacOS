import { useState, useEffect, useRef } from "react";
import folderIcon from "../../assets/BasicIcons/folder.png";
import fileIcon from "../../assets/BasicIcons/file.png";

export default function DesktopItem({
  item,
  onDoubleClick,
  onRightClick,
  isSelected,
  onClick,
  onMenuClick,
  position,
  onPositionChange
}) {
  const icon = item.type === "folder" ? folderIcon : fileIcon;
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef(null);
  const itemRef = useRef(null);

  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: position?.x || 0,
    startPosY: position?.y || 0,
    currentX: position?.x || 0,
    currentY: position?.y || 0
  });

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuAction = (action) => {
    setShowMenu(false);
    onMenuClick(item, action);
  };

  useEffect(() => {
    const itemElement = itemRef.current;
    if (!itemElement) return;

    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.isDragging) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        const deltaX = e.clientX - dragState.current.startX;
        const deltaY = e.clientY - dragState.current.startY;

        dragState.current.currentX = dragState.current.startPosX + deltaX;
        dragState.current.currentY = dragState.current.startPosY + deltaY;

        const minX = 0;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 200;

        dragState.current.currentX = Math.max(minX, Math.min(maxX, dragState.current.currentX));
        dragState.current.currentY = Math.max(minY, Math.min(maxY, dragState.current.currentY));

        animationFrame = requestAnimationFrame(() => {
          itemElement.style.transform = `translate3d(${dragState.current.currentX}px, ${dragState.current.currentY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0 && !e.target.closest('button') && !e.target.closest('.dropdown-menu')) {
        e.preventDefault();
        e.stopPropagation();

        dragState.current.isDragging = true;
        setIsDragging(true);
        onClick(item);

        dragState.current.startX = e.clientX;
        dragState.current.startY = e.clientY;
        dragState.current.startPosX = dragState.current.currentX;
        dragState.current.startPosY = dragState.current.currentY;

        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
        setIsDragging(false);

        document.body.style.userSelect = '';
        document.body.style.cursor = '';

        if (onPositionChange) {
          onPositionChange(item._id, {
            x: dragState.current.currentX,
            y: dragState.current.currentY
          });
        }

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    itemElement.addEventListener('mousedown', handleMouseDown);

    itemElement.style.transform = `translate3d(${dragState.current.currentX}px, ${dragState.current.currentY}px, 0)`;
    itemElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      itemElement.removeEventListener('mousedown', handleMouseDown);

      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [item, onClick, onPositionChange]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      ref={itemRef}
      className="flex flex-col items-center justify-center group w-20 p-2 rounded absolute"
      onDoubleClick={() => onDoubleClick(item)}
      onContextMenu={(e) => onRightClick(e, item)}
      style={{
        left: 0,
        top: 0,
        transition: isDragging ? 'none' : 'all 0.2s',
        zIndex: isSelected ? 10 : 1
      }}
    >
      <button
        onClick={handleMenuClick}
        className="absolute top-1 right-1 w-6 h-6 bg-gray-800 bg-opacity-70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700 z-10"
      >
        <span className="text-white text-xs">⋮</span>
      </button>

      {showMenu && (
        <div
          ref={menuRef}
          className="dropdown-menu absolute top-8 right-0 bg-[#1e1e1f]/85 backdrop-blur-2xl rounded-lg shadow-2xl p-1 min-w-[160px] border border-white/10 text-white text-[13px] z-50 select-none font-sans"
        >
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('open')}
          >
            <span>Open</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⏎</span>
          </button>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('rename')}
          >
            <span>Rename...</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⏎</span>
          </button>
          <div className="h-px bg-white/10 my-1 mx-2"></div>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('copy')}
          >
            <span>Copy</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⌘C</span>
          </button>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('duplicate')}
          >
            <span>Duplicate</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⌘D</span>
          </button>
          <div className="h-px bg-white/10 my-1 mx-2"></div>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('trash')}
          >
            <span>Move to Trash</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⌘⌫</span>
          </button>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-red-500/90 text-red-400 hover:text-white transition-colors outline-none"
            onClick={() => handleMenuAction('delete')}
          >
            <span>Delete Forever</span>
            <span className="text-[10px] opacity-70 ml-2 flex-shrink-0 tracking-wider">⌥⌘⌫</span>
          </button>
          <div className="h-px bg-white/10 my-1 mx-2"></div>
          <button
            className="w-full text-left flex items-center justify-between px-3 py-1 rounded-[5px] cursor-default hover:bg-blue-600/90 text-[#f5f5f7] transition-colors outline-none"
            onClick={() => handleMenuAction('info')}
          >
            <span>Get Info</span>
            <span className="text-[10px] text-zinc-400 font-normal ml-2 flex-shrink-0 tracking-wider">⌘I</span>
          </button>
        </div>
      )}

      <div className="relative">
        <img
          src={icon}
          alt={item.type}
          className="w-16 h-16 group-hover:scale-110 transition-transform pointer-events-none"
          style={{ background: 'transparent' }}
        />
        {item.isTrashed && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            🗑️
          </div>
        )}
      </div>
      <span className="text-white text-xs mt-1 text-center break-words w-full bg-black bg-opacity-50 px-1 py-0.5 rounded pointer-events-none">
        {item.name}
      </span>
    </div>
  );
}
