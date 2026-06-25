import { useState, useEffect } from "react";

export default function DateTime() {
  const [time, setTime] = useState(new Date());
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div
      className="hidden md:block relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 hover:bg-white/20 rounded px-1 sm:px-2 py-1 cursor-pointer text-xs sm:text-sm"
      onMouseEnter={() => setShowTimeTooltip(true)}
      onMouseLeave={() => setShowTimeTooltip(false)}
    >
      <span className="hidden sm:inline">{formatDate(time)}, </span>
      <span>{formatTime(time)}</span>
      <span className="sm:hidden text-xs opacity-75">{formatDate(time).split(' ')[0]}</span>

      {/* Date/Time Tooltip */}
      {showTimeTooltip && (
        <div className="absolute top-8 right-0 bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          <div className="font-semibold">{formatFullDate(time)}</div>
          <div className="text-gray-300">{time.toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
}
