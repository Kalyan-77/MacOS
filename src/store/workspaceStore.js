import { create } from "zustand";

export const useWorkspaceStore = create((set, get) => ({
  windows: [],
  zCounter: 100,

  openWindow: (id, name, component, props = {}, icon = null) => {
    // Check if window already exists
    const existingWindow = get().windows.find(w => w.id === id);

    if (existingWindow) {
      // Just focus the existing window
      get().focusApp(id);
      return;
    }

    set(state => {
      const nextZ = state.zCounter + 1;
      return {
        windows: [
          ...state.windows.map(w => ({ ...w, focused: false })),
          {
            id,
            name,
            component,
            props, // Store props separately so they can be passed to the component
            icon, // Store icon
            minimized: false,
            focused: true,
            zIndex: nextZ
          }
        ],
        zCounter: nextZ
      };
    });
  },

  openApp: (app) => {
    set(state => {
      const nextZ = state.zCounter + 1;
      return {
        windows: [
          ...state.windows.map(w => ({ ...w, focused: false })),
          {
            ...app,
            minimized: false,
            focused: true,
            zIndex: nextZ
          }
        ],
        zCounter: nextZ
      };
    });
  },

  closeApp: (id) => {
    set(state => ({
      windows: state.windows.filter(w => w.id !== id)
    }));
  },

  closeWindow: (id) => {
    get().closeApp(id);
  },

  minimizeApp: (id) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === id ? { ...w, minimized: true, focused: false } : w
      )
    }));
  },

  focusApp: (id) => {
    set(state => {
      const nextZ = state.zCounter + 1;
      return {
        windows: state.windows.map(w =>
          w.id === id
            ? { ...w, minimized: false, focused: true, zIndex: nextZ }
            : { ...w, focused: false }
        ),
        zCounter: nextZ
      };
    });
  }
}));
