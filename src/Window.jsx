import { useState, useRef } from "react";
import { useWindows } from "./context/WindowContext";

export default function MacWindow({ app }) {
  const { minimizeApp, closeApp, focusApp } = useWindows();

  // ---------------- LOCAL UI STATE (KEEP THIS) ----------------
  const [position, setPosition] = useState({ x: 200, y: 120 });
  const [size, setSize] = useState({ w: 500, h: 300 });
  const [isMaximized, setIsMaximized] = useState(false);

  const offset = useRef({ x: 0, y: 0 });

  // ❗ OS decides visibility
  if (app.minimized) return null;

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

  // ---------------- MAXIMIZE ----------------
  const toggleMaximize = () => {
    if (isMaximized) {
      setSize({ w: 500, h: 300 });
      setPosition({ x: 200, y: 120 });
    } else {
      setSize({ w: window.innerWidth, h: window.innerHeight });
      setPosition({ x: 0, y: 0 });
    }
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
      onMouseDown={() => focusApp(app.id)}
      className={`fixed bg-zinc-800 rounded-xl shadow-2xl text-white`}
    >
      {/* TITLE BAR */}
      <div
        onMouseDown={startDrag}
        className="h-10 bg-zinc-900 rounded-t-xl flex items-center px-3 cursor-move select-none"
      >
        <div className="flex gap-2">
          {/* CLOSE */}
          <button
            onClick={() => closeApp(app.id)}
            className="w-3 h-3 rounded-full bg-red-500"
          />

          {/* MINIMIZE */}
          <button
            onClick={() => minimizeApp(app.id)}
            className="w-3 h-3 rounded-full bg-yellow-500"
          />

          {/* MAXIMIZE */}
          <button
            onClick={toggleMaximize}
            className="w-3 h-3 rounded-full bg-green-500"
          />
        </div>

        <div className="flex-1 text-center text-sm text-zinc-400">
          {app.name}
        </div>
      </div>

      {/* CONTENT (APP CONTENT GOES HERE) */}
      <div className="p-4">
        <input
          className="w-full px-3 py-2 rounded bg-zinc-700 outline-none"
          placeholder="State preserved even when minimized"
        />
      </div>
    </div>
  );
}
