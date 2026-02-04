import { useState, useRef, useEffect } from "react";
import { useWindows } from "../context/WindowContext";

export default function MacWindow({ app, userId }) {
  const { minimizeApp, closeApp, focusApp } = useWindows();

  // ---------------- RESPONSIVE STATE ----------------
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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

  // ---------------- RESPONSIVE DETECTION ----------------
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      // Auto-adjust window size and position for different screens
      if (mobile) {
        // Mobile: Full screen with top bar visible
        if (!isMaximized) {
          setPreMaximizeState({ x: position.x, y: position.y, w: size.w, h: size.h });
        }
        setIsMaximized(true);
        setSize({ w: width, h: height - TOPBAR_HEIGHT });
        setPosition({ x: 0, y: TOPBAR_HEIGHT });
      } else if (tablet) {
        // Tablet: Maximize or fit to screen
        const maxWidth = width - 40;
        const maxHeight = height - TOPBAR_HEIGHT - 40;

        if (size.w > maxWidth || size.h > maxHeight) {
          setSize({
            w: Math.min(size.w, maxWidth),
            h: Math.min(size.h, maxHeight)
          });
        }

        // Keep window on screen
        setPosition(prev => ({
          x: Math.max(20, Math.min(prev.x, width - size.w - 20)),
          y: Math.max(TOPBAR_HEIGHT, Math.min(prev.y, height - size.h - 20))
        }));
      } else {
        // Desktop: Keep reasonable bounds
        setPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, width - 300)),
          y: Math.max(TOPBAR_HEIGHT, Math.min(prev.y, height - 200))
        }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------------- DRAG ----------------
  const startDrag = (e) => {
    if (isMaximized || isMobile) return; // Prevent dragging on mobile

    focusApp(app.id);

    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
  };

  const drag = (e) => {
    const maxX = screenSize.width - size.w;
    const maxY = screenSize.height - size.h;

    setPosition({
      x: Math.max(0, Math.min(e.clientX - offset.current.x, maxX)),
      y: Math.max(TOPBAR_HEIGHT, Math.min(e.clientY - offset.current.y, maxY))
    });
  };

  const stopDrag = () => {
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
  };

  // ---------------- RESIZE ----------------
  const startResize = (e, direction) => {
    if (isMobile) return; // No resizing on mobile

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

    // Apply minimum size constraints (responsive)
    const minWidth = isMobile ? screenSize.width : isTablet ? 400 : 320;
    const minHeight = isMobile ? screenSize.height - TOPBAR_HEIGHT : isTablet ? 300 : 220;

    // Apply maximum size constraints
    const maxWidth = screenSize.width - (isMobile ? 0 : 40);
    const maxHeight = screenSize.height - TOPBAR_HEIGHT - (isMobile ? 0 : 40);

    if (newWidth < minWidth) {
      if (direction.includes('w')) {
        newX = resizeStart.current.startX + (resizeStart.current.w - minWidth);
      }
      newWidth = minWidth;
    }

    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      if (direction.includes('w')) {
        newX = resizeStart.current.startX;
      }
    }

    if (newHeight < minHeight) {
      if (direction.includes('n')) {
        newY = resizeStart.current.startY + (resizeStart.current.h - minHeight);
      }
      newHeight = minHeight;
    }

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      if (direction.includes('n')) {
        newY = resizeStart.current.startY;
      }
    }

    // Keep window within bounds
    if (newX < 0) newX = 0;
    if (newY < TOPBAR_HEIGHT) newY = TOPBAR_HEIGHT;
    if (newX + newWidth > screenSize.width) {
      newX = screenSize.width - newWidth;
    }
    if (newY + newHeight > screenSize.height) {
      newY = screenSize.height - newHeight;
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
    if (isMobile) return; // Mobile is always maximized

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
      const maxWidth = screenSize.width - (SIDE_MARGIN * 2);
      const maxHeight = screenSize.height - TOPBAR_HEIGHT;

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

  // Determine border radius based on screen size
  const borderRadius = isMobile ? 'rounded-t-xl' : 'rounded-xl';
  const titleBarRadius = 'rounded-t-xl';
  const contentRadius = isMobile ? 'rounded-b-none' : 'rounded-b-xl';

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
      className={`fixed bg-zinc-800 ${borderRadius} shadow-2xl text-white ${isMobile ? 'touch-none' : ''}`}
    >
      {/* TITLE BAR */}
      <div
        onMouseDown={startDrag}
        className={`h-10 bg-zinc-900 ${titleBarRadius} flex items-center px-3 ${isMobile ? 'cursor-default' : 'cursor-move'
          } select-none`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => closeApp(app.id)}
            className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'
              } rounded-full bg-red-500 hover:bg-red-600 transition-colors`}
            aria-label="Close"
          />
          <button
            onClick={() => minimizeApp(app.id)}
            className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'
              } rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors`}
            aria-label="Minimize"
          />
          {!isMobile && (
            <button
              onClick={toggleMaximize}
              className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
              aria-label="Maximize"
            />
          )}
        </div>

        <div className={`flex-1 text-center ${isMobile ? 'text-xs' : 'text-sm'} text-zinc-400 truncate px-2`}>
          {app.name}
        </div>

        {/* Spacer for alignment */}
        <div className={`${isMobile ? 'w-4' : 'w-[52px]'}`}></div>
      </div>

      {/* CONTENT */}
      <div className={`h-[calc(100%-2.5rem)] overflow-auto ${contentRadius}`}>
        {app.component ? (
          <app.component {...componentProps} />
        ) : (
          <div className="p-4">
            <h1>NO COMPONENT FOUND</h1>
          </div>
        )}
      </div>

      {/* 🔥 RESIZE HANDLES - Only on desktop/tablet */}
      {!isMaximized && !isMobile && (
        <>
          {/* CORNERS */}
          <div
            onMouseDown={(e) => startResize(e, 'nw')}
            className="absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize"
            aria-label="Resize top-left"
          />
          <div
            onMouseDown={(e) => startResize(e, 'ne')}
            className="absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize"
            aria-label="Resize top-right"
          />
          <div
            onMouseDown={(e) => startResize(e, 'sw')}
            className="absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize"
            aria-label="Resize bottom-left"
          />
          <div
            onMouseDown={(e) => startResize(e, 'se')}
            className="absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize"
            aria-label="Resize bottom-right"
          />

          {/* EDGES */}
          <div
            onMouseDown={(e) => startResize(e, 'n')}
            className="absolute -top-1 left-3 right-3 h-2 cursor-n-resize"
            aria-label="Resize top"
          />
          <div
            onMouseDown={(e) => startResize(e, 's')}
            className="absolute -bottom-1 left-3 right-3 h-2 cursor-s-resize"
            aria-label="Resize bottom"
          />
          <div
            onMouseDown={(e) => startResize(e, 'w')}
            className="absolute -left-1 top-3 bottom-3 w-2 cursor-w-resize"
            aria-label="Resize left"
          />
          <div
            onMouseDown={(e) => startResize(e, 'e')}
            className="absolute -right-1 top-3 bottom-3 w-2 cursor-e-resize"
            aria-label="Resize right"
          />
        </>
      )}
    </div>
  );
}