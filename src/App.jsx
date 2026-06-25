import { useState, useEffect } from "react";
import MacOS from "./MacOS";
import LoginScreen from "./LoginScreen";
import BootScreen from "./components/BootScreen";
import useStartupLoader from "./hooks/useStartupLoader";
import { BASE_URL } from "../config";

export default function App() {
  const { isBooting, bootProgress, bootMessage, startupComplete, preloadedData } = useStartupLoader();
  const [renderBootScreen, setRenderBootScreen] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const [fadeLogin, setFadeLogin] = useState(false);
  const [isShutDown, setIsShutDown] = useState(false);

  useEffect(() => {
    const handleLock = () => {
      setIsUnlocked(false);
      setFadeLogin(false);
    };
    const handleRestart = () => {
      window.location.reload();
    };
    const handleShutdown = () => {
      setIsShutDown(true);
    };

    window.addEventListener("macos:lock", handleLock);
    window.addEventListener("macos:restart", handleRestart);
    window.addEventListener("macos:shutdown", handleShutdown);

    return () => {
      window.removeEventListener("macos:lock", handleLock);
      window.removeEventListener("macos:restart", handleRestart);
      window.removeEventListener("macos:shutdown", handleShutdown);
    };
  }, []);

  useEffect(() => {
    if (startupComplete) {
      // Keep BootScreen mounted briefly for fade-out animation to complete
      const timer = setTimeout(() => {
        setRenderBootScreen(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [startupComplete]);

  // Request fullscreen when opening the Mac environment
  useEffect(() => {
    const enterFullscreen = () => {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        return docEl.requestFullscreen();
      }
      return Promise.resolve();
    };

    // Try immediately on load (might be blocked, but good to attempt)
    enterFullscreen().catch((err) => {
      console.log("Auto-fullscreen on load blocked or failed:", err);
    });

    // Register event listeners for user interaction
    const handleInteraction = () => {
      enterFullscreen()
        .then(() => {
          // Successfully entered fullscreen, clean up the listeners
          cleanup();
        })
        .catch((err) => {
          console.log("Fullscreen attempt on interaction failed:", err);
          // Keep listeners active to try on the next user interaction
        });
    };

    const cleanup = () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return cleanup;
  }, []);

  const handleUnlock = () => {
    setFadeLogin(true);
    // Smooth transition from LoginScreen to Desktop
    setShowDesktop(true);
    const timer = setTimeout(() => {
      setIsUnlocked(true);
    }, 600);
    return () => clearTimeout(timer);
  };

  if (isShutDown) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-zinc-500 font-sans select-none z-[99999]">
        <button
          onClick={() => {
            setIsShutDown(false);
            window.location.reload();
          }}
          className="w-16 h-16 rounded-full border-2 border-zinc-750 hover:border-white text-zinc-450 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg mb-4 text-2xl font-bold"
          title="Turn On Mac"
        >
          ⏻
        </button>
        <span className="text-sm">Click power button to turn on Mac</span>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* 1. Desktop layer (rendered under the login layer when unlocked) */}
      {showDesktop && (
        <div className="animate-fade-in w-full h-full">
          <MacOS preloadedData={preloadedData} />
        </div>
      )}

      {/* 2. Login screen layer */}
      {startupComplete && !isUnlocked && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-out z-40 ${fadeLogin ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
        >
          <LoginScreen
            onUnlock={handleUnlock}
            userName={preloadedData?.authData?.user?.name || preloadedData?.profileData?.name}
            avatarUrl={
              preloadedData?.profileData?.avatar
                ? `${BASE_URL}${preloadedData.profileData.avatar}`
                : null
            }
          />
        </div>
      )}

      {/* 3. Boot loading screen layer */}
      {renderBootScreen && (
        <BootScreen
          progress={bootProgress}
          message={bootMessage}
          isBooting={isBooting}
        />
      )}
    </div>
  );
}