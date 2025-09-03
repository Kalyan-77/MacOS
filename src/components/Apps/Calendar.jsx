import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Calendar, Mail, Search } from 'lucide-react';

export default function calendar({ onClose }) {
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('Month'); // Day, Week, Month, Year

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const windowRef = useRef(null);

  // Dragging variables for native-like movement
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 200,
    startWindowY: 100,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // Calendar utilities
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (date, day) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const isSelected = (date, day) => {
    return date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           day === selectedDate.getDate();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonth);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      });
    }

    // Next month's leading days
    const totalCells = 42; // 6 rows × 7 days
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const remainingCells = totalCells - days.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day)
      });
    }

    return days;
  };

  // Navigation handlers
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Initialize dragging system - same as NotePad
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let highestZ = 1000;
    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        const deltaX = e.clientX - dragState.current.mouseTouchX;
        const deltaY = e.clientY - dragState.current.mouseTouchY;
        
        dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
        dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

        const minX = -windowElement.offsetWidth + 100;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
        dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

        animationFrame = requestAnimationFrame(() => {
          windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        const titleBar = e.target.closest('.title-bar');
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          windowElement.style.zIndex = highestZ;
          highestZ += 1;

          dragState.current.mouseTouchX = e.clientX;
          dragState.current.mouseTouchY = e.clientY;
          dragState.current.startWindowX = dragState.current.currentWindowX;
          dragState.current.startWindowY = dragState.current.currentWindowY;

          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'default';
          document.body.style.pointerEvents = 'none';
          windowElement.style.pointerEvents = 'auto';
        }
      }
    };

    const handleMouseUp = (e) => {
      if (dragState.current.holdingWindow) {
        dragState.current.holdingWindow = false;
        setIsDragging(false);
        
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.pointerEvents = '';
        windowElement.style.pointerEvents = '';

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    const handleContextMenu = (e) => {
      if (dragState.current.holdingWindow) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized]);

  // Traffic light handlers
  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = 25;
      windowRef.current.style.transform = `translate3d(0px, 25px, 0)`;
    }
  };

  const handleWindowClick = () => {
    setIsActive(true);
  };

  const calendarDays = generateCalendarDays();

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        left: 0,
        top: 0,
        width: isMaximized ? '100vw' : '1000px',
        height: isMaximized ? 'calc(100vh - 25px)' : '600px',
        zIndex: isActive ? 1000 : 999,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div
        className={`title-bar h-12 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
          isActive ? 'bg-gray-100' : 'bg-gray-50'
        }`}
        style={{ 
          cursor: 'default',
          WebkitAppRegion: 'drag'
        }}
      >
        {/* Traffic Light Buttons */}
        <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
            onClick={handleClose}
            title="Close"
            style={{ cursor: 'pointer' }}
          >
            <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
            onClick={handleMinimize}
            title="Minimize"
            style={{ cursor: 'pointer' }}
          >
            <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
            style={{ cursor: 'pointer' }}
          >
            <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Toolbar Icons */}
        <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" style={{ cursor: 'pointer' }}>
            <Calendar size={16} className="text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" style={{ cursor: 'pointer' }}>
            <Mail size={16} className="text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" style={{ cursor: 'pointer' }}>
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>

        {/* Window Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className="text-sm font-medium text-gray-700">Calendar</h1>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-7 pr-3 py-1 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ cursor: 'text' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full bg-white flex flex-col" style={{ height: 'calc(100% - 3rem)' }}>
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-200">
          {/* View Buttons */}
          <div className="flex items-center gap-1">
            {['Day', 'Week', 'Month', 'Year'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  view === viewType
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{ cursor: 'pointer' }}
              >
                {viewType}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Header with Month/Year and Navigation */}
        <div className="flex items-center justify-between px-6 py-3">
          <h2 className="text-2xl font-bold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
              style={{ cursor: 'pointer' }}
            >
              Today
            </button>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              style={{ cursor: 'pointer' }}
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 px-6 pb-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 h-full">
            {calendarDays.map((dayInfo, index) => {
              const isCurrentMonth = dayInfo.isCurrentMonth;
              const isTodayDate = isToday(currentDate, dayInfo.day) && isCurrentMonth;
              const isSelectedDate = isSelected(currentDate, dayInfo.day) && isCurrentMonth;
              
              return (
                <button
                  key={index}
                  onClick={() => isCurrentMonth && setSelectedDate(dayInfo.date)}
                  className={`
                    relative h-16 p-2 text-left rounded-lg border transition-all duration-150 hover:bg-gray-50
                    ${isCurrentMonth 
                      ? 'bg-white border-gray-200 text-gray-900' 
                      : 'bg-gray-50 border-transparent text-gray-400'
                    }
                    ${isTodayDate ? 'ring-2 ring-red-500 bg-red-50' : ''}
                    ${isSelectedDate ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  style={{ cursor: isCurrentMonth ? 'pointer' : 'default' }}
                >
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'text-red-600' : ''}
                    ${isSelectedDate ? 'text-blue-600' : ''}
                  `}>
                    {dayInfo.day === 1 && !isCurrentMonth && dayInfo.isNextMonth 
                      ? `Sep ${dayInfo.day}` 
                      : dayInfo.day
                    }
                  </span>
                  
                  {/* Today indicator */}
                  {isTodayDate && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}