import { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';

export default function Calculator({ onClose, zIndex = 1000, onFocus }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [expression, setExpression] = useState('');
  
  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 400, y: 200 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dragging variables for native-like movement (desktop only)
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 400,
    startWindowY: 200,
    currentWindowX: 400,
    currentWindowY: 50
  });

  // Initialize dragging system - native Windows-like movement (desktop only)
  useEffect(() => {
    if (isMobile) return; // Disable dragging on mobile
    
    const windowElement = windowRef.current;
    if (!windowElement) return;

    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        // Cancel any existing animation frame to ensure smooth movement
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        // Calculate direct position based on mouse offset from initial click
        const deltaX = e.clientX - dragState.current.mouseTouchX;
        const deltaY = e.clientY - dragState.current.mouseTouchY;
        
        dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
        dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

        // Allow more freedom - only prevent going completely off screen
        const minX = -windowElement.offsetWidth + 100;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
        dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

        // Use requestAnimationFrame for ultra-smooth movement
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
          
          // Call onFocus immediately when starting drag to bring window to front
          if (onFocus) {
            onFocus();
          }
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

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
  }, [isMaximized, isMobile, onFocus]);

  // Calculator logic
  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
      setExpression(`${inputValue} ${nextOperation}`);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      setExpression(`${newValue} ${nextOperation}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setExpression(`${previousValue} ${operation} ${inputValue} =`);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Traffic light handlers
  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMobile) return; // Disable maximize on mobile
    
    if (isMaximized) {
      // Restore to previous position
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    } else {
      // Store current position and maximize
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
    if (onFocus) onFocus();
  };

  // Mobile-specific styles
  const mobileStyles = isMobile ? {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    borderRadius: '0',
    transform: 'none'
  } : {};

  return (
    <div
      ref={windowRef}
      className={`${isMobile ? 'fixed inset-0' : 'fixed'} bg-black/70 ${isMobile ? 'rounded-none' : 'rounded-xl'} shadow-2xl overflow-hidden transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        ...(isMobile ? mobileStyles : {
          left: 0,
          top: 0,
          width: isMaximized ? '100vw' : '1000px',
          height: isMaximized ? 'calc(100vh - 25px)' : '600px',
        }),
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={handleWindowClick}
    >
      {/* Title Bar - Hidden on mobile */}
      {!isMobile && (
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
              <Minus size={8} className="text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
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

          {/* Window Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
            <h1 className="text-sm font-medium text-gray-700">Calculator</h1>
          </div>

          <div style={{ WebkitAppRegion: 'no-drag' }}></div>
        </div>
      )}

      {/* Mobile Header Bar */}
      {isMobile && (
        <div className="bg-gray-900/90 backdrop-blur-sm p-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">Calculator</h1>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Calculator Content */}
      <div className={`h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 ${isMobile ? 'p-4' : 'p-6'} flex flex-col`} 
           style={{ height: isMobile ? 'calc(100% - 4rem)' : 'calc(100% - 3rem)' }}>
        
        {/* Display */}
        <div className={`bg-white/20 backdrop-blur-sm rounded-2xl ${isMobile ? 'mb-4 p-4' : 'mb-4 p-4'} border border-white/30 flex-shrink-0`}>
          {/* Expression display */}
          <div className={`text-right font-mono text-white/70 min-h-[20px] sm:min-h-[25px] flex items-center justify-end mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}>
            {expression || '\u00A0'}
          </div>
          {/* Main display */}
          <div className={`text-right font-mono text-white font-bold min-h-[40px] sm:min-h-[50px] flex items-center justify-end break-all ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {display}
          </div>
        </div>

        {/* Button Grid */}
        <div className={`grid grid-cols-4 ${isMobile ? 'gap-3' : 'gap-3'} flex-1`}>
          {/* Row 1 */}
          <button
            onClick={() => inputNumber(7)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            7
          </button>
          <button
            onClick={() => inputNumber(8)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            8
          </button>
          <button
            onClick={() => inputNumber(9)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            9
          </button>
          <button
            onClick={() => performOperation('+')}
            className={`bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            +
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputNumber(4)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            4
          </button>
          <button
            onClick={() => inputNumber(5)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            5
          </button>
          <button
            onClick={() => inputNumber(6)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            6
          </button>
          <button
            onClick={() => performOperation('-')}
            className={`bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            -
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputNumber(1)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            1
          </button>
          <button
            onClick={() => inputNumber(2)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            2
          </button>
          <button
            onClick={() => inputNumber(3)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            3
          </button>
          <button
            onClick={() => performOperation('*')}
            className={`bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            ×
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputNumber(0)}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            0
          </button>
          <button
            onClick={inputDot}
            className={`bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-xl border border-white/30 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            .
          </button>
          <button
            onClick={clear}
            className={`bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 active:bg-red-500/90 text-white font-bold rounded-xl border border-red-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-lg min-h-[60px]' : 'text-lg'}`}
            style={{ cursor: 'pointer' }}
          >
            C
          </button>
          <button
            onClick={() => performOperation('/')}
            className={`bg-orange-500/60 backdrop-blur-sm hover:bg-orange-500/80 active:bg-orange-500/90 text-white font-bold rounded-xl border border-orange-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            ÷
          </button>

          {/* Row 5 */}
          <button
            onClick={backspace}
            className={`bg-yellow-500/60 backdrop-blur-sm hover:bg-yellow-500/80 active:bg-yellow-500/90 text-white font-bold rounded-xl border border-yellow-300/50 transition-all duration-150 active:scale-95 col-span-3 ${isMobile ? 'text-base min-h-[60px]' : 'text-sm'}`}
            style={{ cursor: 'pointer' }}
          >
            ⌫ Backspace
          </button>
          <button
            onClick={handleEquals}
            className={`bg-green-500/60 backdrop-blur-sm hover:bg-green-500/80 active:bg-green-500/90 text-white font-bold rounded-xl border border-green-300/50 transition-all duration-150 active:scale-95 ${isMobile ? 'text-xl min-h-[60px]' : 'text-2xl'}`}
            style={{ cursor: 'pointer' }}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}