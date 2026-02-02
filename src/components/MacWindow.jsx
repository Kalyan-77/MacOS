import { useState, useRef } from "react";
import { useWindows } from "../context/WindowContext";

export default function MacWindow({ app, userId }) {
  const { minimizeApp, closeApp, focusApp } = useWindows();

  // ---------------- LOCAL UI STATE ----------------
  const [position, setPosition] = useState({ x: 200, y: 60 });
  const [size, setSize] = useState({ w: 900, h: 550 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({ x: 200, y: 120, w: 500, h: 300 });

  const offset = useRef({ x: 0, y: 0 });

  // 🔥 RESIZE STATE
  const resizeStart = useRef({
    w: 0,
    h: 0,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    direction: null
  });

  // Constants for TopBar and Dock heights
  const TOPBAR_HEIGHT = 40;
  const DOCK_HEIGHT = 40;
  const SIDE_MARGIN = 0;

  // ---------------- DRAG ----------------
  const startDrag = (e) => {
    if (isMaximized) return;

    focusApp(app.id);

    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  };

  const drag = (e) => {
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    });
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  };

  // ---------------- RESIZE ----------------
  const startResize = (e, direction) => {
    e.stopPropagation();
    focusApp(app.id);

    resizeStart.current = {
      w: size.w,
      h: size.h,
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y,
      direction
    };

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  };

  const resize = (e) => {
    const deltaX = e.clientX - resizeStart.current.x;
    const deltaY = e.clientY - resizeStart.current.y;
    const direction = resizeStart.current.direction;

    let newWidth = resizeStart.current.w;
    let newHeight = resizeStart.current.h;
    let newX = resizeStart.current.startX;
    let newY = resizeStart.current.startY;

    // Handle horizontal resizing
    if (direction.includes('e')) {
      newWidth = resizeStart.current.w + deltaX;
    } else if (direction.includes('w')) {
      newWidth = resizeStart.current.w - deltaX;
      newX = resizeStart.current.startX + deltaX;
    }

    // Handle vertical resizing
    if (direction.includes('s')) {
      newHeight = resizeStart.current.h + deltaY;
    } else if (direction.includes('n')) {
      newHeight = resizeStart.current.h - deltaY;
      newY = resizeStart.current.startY + deltaY;
    }

    // Apply minimum size constraints
    const minWidth = 320;
    const minHeight = 220;

    if (newWidth < minWidth) {
      if (direction.includes('w')) {
        newX = resizeStart.current.startX + (resizeStart.current.w - minWidth);
      }
      newWidth = minWidth;
    }

    if (newHeight < minHeight) {
      if (direction.includes('n')) {
        newY = resizeStart.current.startY + (resizeStart.current.h - minHeight);
      }
      newHeight = minHeight;
    }

    setSize({ w: newWidth, h: newHeight });
    setPosition({ x: newX, y: newY });
  };

  const stopResize = () => {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  };

  // ---------------- MAXIMIZE ----------------
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore to previous size and position
      setSize({ w: preMaximizeState.w, h: preMaximizeState.h });
      setPosition({ x: preMaximizeState.x, y: preMaximizeState.y });
    } else {
      // Save current state before maximizing
      setPreMaximizeState({
        x: position.x,
        y: position.y,
        w: size.w,
        h: size.h
      });

      // Maximize with proper spacing
      const maxWidth = window.innerWidth - (SIDE_MARGIN * 2);
      const maxHeight = window.innerHeight - TOPBAR_HEIGHT;

      setSize({ w: maxWidth, h: maxHeight });
      setPosition({ x: SIDE_MARGIN, y: TOPBAR_HEIGHT });
    }
    setIsMaximized(!isMaximized);
  };

  // Prepare props to pass to component
  const componentProps = {
    userId,
    onClose: () => closeApp(app.id),
    ...(app.props || {}) // Spread any additional props stored in the app object
  };

  console.log('MacWindow rendering:', app.name, 'with props:', componentProps);

  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: app.zIndex,
        display: app.minimized ? "none" : "block"
      }}
      onMouseDown={() => focusApp(app.id)}
      className="fixed bg-zinc-800 rounded-xl shadow-2xl text-white"
    >
      {/* TITLE BAR */}
      <div
        onMouseDown={startDrag}
        className="h-10 bg-zinc-900 rounded-t-xl flex items-center px-3 cursor-move select-none"
      >
        <div className="flex gap-2">
          <button
            onClick={() => closeApp(app.id)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          />
          <button
            onClick={() => minimizeApp(app.id)}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
          />
          <button
            onClick={toggleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
          />
        </div>

        <div className="flex-1 text-center text-sm text-zinc-400">
          {app.name}
        </div>
      </div>

      {/* CONTENT */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto">
        {app.component ? (
          <app.component {...componentProps} />
        ) : (
          <div className="p-4">
            <h1>NO COMPONENT FOUND</h1>
          </div>
        )}
      </div>

      {/* 🔥 RESIZE HANDLES */}
      {!isMaximized && (
        <>
          {/* CORNERS */}
          <div
            onMouseDown={(e) => startResize(e, 'nw')}
            className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 'ne')}
            className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 'sw')}
            className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 'se')}
            className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize"
          />

          {/* EDGES */}
          <div
            onMouseDown={(e) => startResize(e, 'n')}
            className="absolute -top-1 left-3 right-3 h-2 cursor-n-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 's')}
            className="absolute -bottom-1 left-3 right-3 h-2 cursor-s-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 'w')}
            className="absolute -left-1 top-3 bottom-3 w-2 cursor-w-resize"
          />
          <div
            onMouseDown={(e) => startResize(e, 'e')}
            className="absolute -right-1 top-3 bottom-3 w-2 cursor-e-resize"
          />
        </>
      )}
    </div>
  );
}