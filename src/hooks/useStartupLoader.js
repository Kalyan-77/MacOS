import { useState, useEffect, useRef } from "react";
import { authService } from "../api/authService";
import { finderService } from "../api/finderService";
import { configService } from "../api/configService";

export default function useStartupLoader() {
  const [isBooting, setIsBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootMessage, setBootMessage] = useState("Initializing Environment...");
  const [startupComplete, setStartupComplete] = useState(false);
  
  // Storage for preloaded backend data
  const [preloadedData, setPreloadedData] = useState({
    authData: null,
    desktopItems: [],
    dockConfig: null,
    profileData: null
  });

  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const dataRef = useRef({
    authData: null,
    desktopItems: [],
    dockConfig: null,
    profileData: null
  });

  useEffect(() => {
    let active = true;
    let progressTimer = null;

    // Helper to update progress smoothly towards a target value
    const startProgressAnimation = () => {
      progressTimer = setInterval(() => {
        if (!active) return;
        
        const current = progressRef.current;
        const target = targetProgressRef.current;

        if (current < target) {
          // Increment progress smoothly
          // Faster increment when far, slower when close
          const diff = target - current;
          const step = Math.max(0.5, Math.min(3, diff * 0.15));
          const next = Math.min(target, current + step);
          
          progressRef.current = next;
          setBootProgress(Math.floor(next));
        }
      }, 300); // 30ms for ~33fps smooth animation
    };

    // Main sequential boot sequence
    const runBootSequence = async () => {
      try {
        startProgressAnimation();

        // ----------------------------------------------------
        // Phase 1: Initializing Environment (0% to 10%)
        // ----------------------------------------------------
        setBootMessage("Initializing Environment...");
        targetProgressRef.current = 10;
        await new Promise((resolve) => setTimeout(resolve, 600));

        // ----------------------------------------------------
        // Phase 2: Connecting Storage Services (10% to 25%)
        // ----------------------------------------------------
        if (!active) return;
        setBootMessage("Connecting Storage Services...");
        targetProgressRef.current = 25;
        await new Promise((resolve) => setTimeout(resolve, 800));

        // ----------------------------------------------------
        // Phase 3: Restoring User Session (25% to 40%)
        // ----------------------------------------------------
        if (!active) return;
        setBootMessage("Restoring User Session...");
        targetProgressRef.current = 40;

        let authData = { loggedIn: false, user: null };
        try {
          const data = await authService.checkSession();
          if (data && data.loggedIn && data.user) {
            authData = data;
          }
        } catch (err) {
          console.warn("Backend auth connection error, falling back to offline mode:", err);
        }
        
        dataRef.current.authData = authData;
        setPreloadedData((prev) => ({ ...prev, authData }));
        await new Promise((resolve) => setTimeout(resolve, 600));

        // ----------------------------------------------------
        // Phase 4: Loading Profile & User Files/Folders (40% to 60%)
        // ----------------------------------------------------
        if (!active) return;
        
        const userId = authData.user?._id;
        if (userId) {
          setBootMessage("Loading User Profile...");
          targetProgressRef.current = 50;

          // Fetch WhatsApp profile if exists
          try {
            const data = await authService.getProfile();
            if (data) {
              dataRef.current.profileData = data;
              setPreloadedData((prev) => ({ ...prev, profileData: data }));
            }
          } catch (err) {
            console.warn("Error preloading user profile:", err);
          }

          if (!active) return;
          setBootMessage("Loading Files and Folders...");
          targetProgressRef.current = 60;

          // Fetch Finder/Desktop Items
          try {
            const data = await finderService.getUserItems(userId);
            if (data) {
              const desktopItems = (data.items || []).filter(
                (item) => item.parentId === "desktop"
              );
              dataRef.current.desktopItems = desktopItems;
              setPreloadedData((prev) => ({ ...prev, desktopItems }));
            }
          } catch (err) {
            console.warn("Error preloading desktop items:", err);
          }
        } else {
          // Unauthenticated/offline fallback simulation
          setBootMessage("Loading User Profile...");
          targetProgressRef.current = 50;
          await new Promise((resolve) => setTimeout(resolve, 300));
          
          if (!active) return;
          setBootMessage("Loading Files and Folders...");
          targetProgressRef.current = 60;
          await new Promise((resolve) => setTimeout(resolve, 400));
        }

        // ----------------------------------------------------
        // Phase 5: Loading Applications & Dock Config (60% to 80%)
        // ----------------------------------------------------
        if (!active) return;
        setBootMessage("Loading Applications...");
        targetProgressRef.current = 80;

        if (userId) {
          try {
            const config = await configService.getDockConfig(userId);
            if (config) {
              dataRef.current.dockConfig = config;
              setPreloadedData((prev) => ({ ...prev, dockConfig: config }));
            }
          } catch (err) {
            console.warn("Error preloading dock config:", err);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        // ----------------------------------------------------
        // Phase 6: Preparing Desktop (80% to 100%)
        // ----------------------------------------------------
        if (!active) return;
        setBootMessage("Preparing Desktop...");
        targetProgressRef.current = 98;
        await new Promise((resolve) => setTimeout(resolve, 700));

        if (!active) return;
        setBootMessage("Starting Cloud Storage OS...");
        targetProgressRef.current = 100;
        
        // Wait until animation reaches exactly 100
        while (progressRef.current < 100) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // A final tiny hold at 100% for smooth transition feel
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (active) {
          setIsBooting(false);
          setStartupComplete(true);
        }
      } catch (error) {
        console.error("Boot sequence critical failure:", error);
        // Ensure system can still boot even on unexpected errors
        if (active) {
          setBootProgress(100);
          setIsBooting(false);
          setStartupComplete(true);
        }
      }
    };

    runBootSequence();

    return () => {
      active = false;
      if (progressTimer) clearInterval(progressTimer);
    };
  }, []);

  return {
    isBooting,
    bootProgress,
    bootMessage,
    startupComplete,
    preloadedData
  };
}
