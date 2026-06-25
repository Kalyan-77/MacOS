import { useState, useEffect } from "react";

export default function BatteryStatus() {
  const [battery, setBattery] = useState({ level: 0.85, charging: false });
  const [showBatteryTooltip, setShowBatteryTooltip] = useState(false);

  useEffect(() => {
    let active = true;
    let cancelListeners = null;

    const updateBattery = () => {
      if ("getBattery" in navigator) {
        navigator.getBattery().then((batt) => {
          if (!active) return;
          setBattery({ level: batt.level, charging: batt.charging });

          const updateHandler = () => {
            if (active) {
              setBattery({ level: batt.level, charging: batt.charging });
            }
          };

          batt.addEventListener("levelchange", updateHandler);
          batt.addEventListener("chargingchange", updateHandler);

          cancelListeners = () => {
            batt.removeEventListener("levelchange", updateHandler);
            batt.removeEventListener("chargingchange", updateHandler);
          };
        });
      }
    };

    updateBattery();

    return () => {
      active = false;
      if (cancelListeners) {
        cancelListeners();
      }
    };
  }, []);

  const percent = Math.round(battery.level * 100);

  return (
    <div
      className="relative flex items-center gap-1 sm:gap-2 hover:bg-white/20 rounded px-1 sm:px-2 py-1 cursor-pointer"
      onMouseEnter={() => setShowBatteryTooltip(true)}
      onMouseLeave={() => setShowBatteryTooltip(false)}
    >
      {/* Battery Icon */}
      <div className="relative w-5 h-2.5 sm:w-6 sm:h-3 border border-white rounded-sm overflow-hidden">
        {/* Fill bar */}
        <div
          className={`h-full transition-all duration-300 ${percent > 20
            ? battery.charging
              ? "bg-green-400"
              : "bg-white"
            : "bg-red-500"
            }`}
          style={{ width: `${Math.max(percent, 3)}%` }}
        ></div>

        {/* Battery tip */}
        <div className="absolute -right-0.5 top-0.5 h-1 sm:h-1.5 w-0.5 bg-white rounded-sm"></div>

        {/* Charging bolt */}
        {battery.charging && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs">⚡</span>
          </div>
        )}
      </div>

      {/* Percentage */}
      <span className="text-xs">{percent}%</span>

      {/* Battery Tooltip */}
      {showBatteryTooltip && (
        <div className="absolute top-8 right-0 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-semibold">Battery</div>
          <div className="text-gray-300">
            {battery.charging ? `Charging: ${percent}%` : `${percent}% remaining`}
          </div>
          <div className="text-gray-400 text-xs mt-1">
            {battery.charging ? "Power adapter connected" : "Not charging"}
          </div>
        </div>
      )}
    </div>
  );
}
