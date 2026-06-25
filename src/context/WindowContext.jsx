/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";

const WindowContext = createContext();

export function WindowProvider({ children }) {
  const workspace = useWorkspaceStore();

  return (
    <WindowContext.Provider value={workspace}>
      {children}
    </WindowContext.Provider>
  );
}

export const useWindows = () => useContext(WindowContext);