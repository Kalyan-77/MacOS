import { createContext, useContext, useState } from "react";

const WindowContext = createContext();
export const useWindows = () => useContext(WindowContext);

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [zCounter, setZCounter] = useState(1);

  const openWindow = (id, name, component, props = {}, icon = null) => {
    // Check if window already exists
    const existingWindow = windows.find(w => w.id === id);

    if (existingWindow) {
      // Just focus the existing window
      focusApp(id);
      return;
    }

    setWindows(prev => [
      ...prev.map(w => ({ ...w, focused: false })),
      {
        id,
        name,
        component,
        props, // Store props separately so they can be passed to the component
        icon, // 🔥 Store icon
        minimized: false,
        focused: true,
        zIndex: zCounter + 1
      }
    ]);
    setZCounter(z => z + 1);
  };

  const openApp = (app) => {
    setWindows(prev => [
      ...prev.map(w => ({ ...w, focused: false })),
      {
        ...app,
        minimized: false,
        focused: true,
        zIndex: zCounter + 1
      }
    ]);
    setZCounter(z => z + 1);
  };

  const closeApp = (id) =>
    setWindows(prev => prev.filter(w => w.id !== id));

  const closeWindow = (id) => closeApp(id);

  const minimizeApp = (id) =>
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, minimized: true, focused: false }
          : w
      )
    );

  const focusApp = (id) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, minimized: false, focused: true, zIndex: zCounter + 1 }
          : { ...w, focused: false }
      )
    );
    setZCounter(z => z + 1);
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        openApp,
        closeApp,
        closeWindow,
        minimizeApp,
        focusApp
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}