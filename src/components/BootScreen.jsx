import { useEffect, useState } from "react";
import logo from "../assets/BasicIcons/white.png";
export default function BootScreen({ progress, message, isBooting }) {
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    if (!isBooting) {
      setFadeExit(true);
    }
  }, [isBooting]);

  return (
    <div
      className={`fixed inset-0 bg-[#000000] text-white flex flex-col items-center justify-between py-24 z-[99999] transition-opacity duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
        fadeExit ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Spacer to push logo to center */}
      <div className="flex-1"></div>

      {/* Core Center Content: Logo, Title, Loading Bar */}
      <div className="flex flex-col items-center justify-center space-y-8 max-w-sm w-full px-8">
        {/* Apple macOS Logo */}
        <div className="w-24 h-24 flex items-center justify-center transition-transform duration-700 ease-out transform hover:scale-105 select-none">
          <img
            src={logo}
            alt="macOS Logo"
            className="w-full h-full object-contain filter invert"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-wide text-white font-sans opacity-90">
            Cloud Storage OS
          </h1>
          <p className="text-xs text-gray-500 tracking-wider mt-1 uppercase font-medium">
            Next Generation Storage Environment
          </p>
        </div>

        {/* Apple-style Progress Bar */}
        <div className="w-56 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative border border-zinc-900/50">
          <div
            className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Loading Progress Info (Glassmorphism Styled) */}
        <div className="flex flex-col items-center space-y-1 w-full pt-2">
          <span className="text-xs text-gray-400 font-medium tracking-wide">
            {progress}%
          </span>
          <span className="text-sm text-zinc-300 font-normal text-center min-h-[20px] transition-all duration-300 ease-in-out">
            {message}
          </span>
        </div>
      </div>

      {/* Spacer & Bottom footer */}
      <div className="flex-1 flex items-end justify-center select-none">
        <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">
          Build v1.0.0 • Secured Storage Network
        </span>
      </div>
    </div>
  );
}
