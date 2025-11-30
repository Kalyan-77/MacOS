import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function Photos({ onClose, fileToOpen = null, userId, zIndex = 1000, onFocus }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState('Untitled Image');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 300, y: 150 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const imageRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 300,
    startWindowY: 150,
    currentWindowX: 300,
    currentWindowY: 50
  });

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      // Auto-maximize on mobile
      if (isMobileDevice && !isMaximized) {
        setIsMaximized(true);
        dragState.current.currentWindowX = 0;
        dragState.current.currentWindowY = 0;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (fileToOpen && fileToOpen._id) {
      loadImage(fileToOpen);
    }
  }, [fileToOpen]);

  const loadImage = async (file) => {
    try {
      setIsLoading(true);
      setFileName(file.name);
      
      const driveId = file._id;

      if (driveId) {
        const imageDisplayUrl = `${BASE_URL}/cloud/display/${driveId}`;
        setImageUrl(imageDisplayUrl);
      } else if (file.url) {
        setImageUrl(file.url);
      } else {
        throw new Error('No image source available');
      }
      
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    } catch (error) {
      console.error("Error loading image:", error);
      alert("Failed to load image: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMobile) return;

    const windowElement = windowRef.current;
    if (!windowElement) return;

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

          if (onFocus) {
            onFocus();
          }
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          // z-index is managed by the parent MacOS component via the `zIndex` prop

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

    const handleMouseUp = () => {
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
  }, [isMaximized, isMobile]);

  const handleImageMouseDown = (e) => {
    if (zoom > 1) {
      setIsDraggingImage(true);
      dragStartPos.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleImageMouseMove = (e) => {
    if (isDraggingImage && zoom > 1) {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    }
  };

  const handleImageMouseUp = () => {
    setIsDraggingImage(false);
  };

  useEffect(() => {
    if (isDraggingImage) {
      document.addEventListener('mousemove', handleImageMouseMove);
      document.addEventListener('mouseup', handleImageMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleImageMouseMove);
        document.removeEventListener('mouseup', handleImageMouseUp);
      };
    }
  }, [isDraggingImage, zoom]);

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
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
      }
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = isMobile ? 0 : 25;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(0px, ${isMobile ? 0 : 25}px, 0)`;
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      if (newZoom <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleWindowClick = () => {
    setIsActive(true);
    if(onFocus) onFocus();
  };

  // Get responsive dimensions
  const getWindowDimensions = () => {
    if (isMaximized) {
      return {
        width: '100vw',
        height: isMobile ? '100vh' : 'calc(100vh - 25px)'
      };
    }
    
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh'
      };
    }
    
    // Desktop windowed mode
    const maxWidth = Math.min(1000, window.innerWidth - 100);
    const maxHeight = Math.min(600, window.innerHeight - 100);
    
    return {
      width: `${maxWidth}px`,
      height: `${maxHeight}px`
    };
  };

  const dimensions = getWindowDimensions();

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white overflow-hidden transition-all duration-200 ${
        isMobile ? 'rounded-none' : 'rounded-xl shadow-2xl'
      } ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      } ${
        isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`}
      style={{
        left: 0,
        top: 0,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: zIndex,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto',
        transition: isDragging ? 'none' : 'all 0.2s'
      }}
      onClick={() => {
        handleWindowClick();
        if (onFocus) onFocus();
      }}
    >
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gray-100 border-b border-gray-200 flex items-center justify-between ${isMobile ? 'px-4' : 'px-4'} select-none transition-colors duration-200 ${
          isActive ? 'bg-gray-100' : 'bg-gray-50'
        }`}
        style={{ 
          cursor: 'default',
          WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
        }}
      >
        <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer`}
            onClick={handleClose}
            title="Close"
          >
            <X size={isMobile ? 10 : 8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {!isMobile && (
            <>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                onClick={handleMinimize}
                title="Minimize"
              >
                <div className="w-2 h-0.5 bg-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center cursor-pointer"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
              >
                <div className="w-1.5 h-1.5 border border-green-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-700`}>
            {isMobile && fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
            {!isMobile && fileName}
            {isLoading && ' (Loading...)'}
          </h1>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={handleZoomOut}
            disabled={isLoading || zoom <= 0.5}
            className={`flex items-center gap-1 ${isMobile ? 'px-2.5 py-1.5' : 'px-2 py-1'} text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Zoom Out"
          >
            <ZoomOut size={isMobile ? 16 : 14} />
          </button>
          <span className={`text-xs text-gray-600 ${isMobile ? 'min-w-14' : 'min-w-12'} text-center`}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={isLoading || zoom >= 3}
            className={`flex items-center gap-1 ${isMobile ? 'px-2.5 py-1.5' : 'px-2 py-1'} text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Zoom In"
          >
            <ZoomIn size={isMobile ? 16 : 14} />
          </button>
          {!isMobile && (
            <>
              <button
                onClick={handleRotate}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50"
                title="Rotate"
              >
                <RotateCw size={14} />
              </button>
              <button
                onClick={handleFitToScreen}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 cursor-pointer disabled:opacity-50"
                title="Fit to Screen"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div 
        className="h-full bg-gray-900 flex items-center justify-center overflow-hidden relative" 
        style={{ height: isMobile ? 'calc(100% - 3.5rem)' : 'calc(100% - 3rem)' }}
      >
        {isLoading ? (
          <div className="text-white text-lg">Loading image...</div>
        ) : imageUrl ? (
          <img
            ref={imageRef}
            src={imageUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain transition-transform"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDraggingImage ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none'
            }}
            onMouseDown={handleImageMouseDown}
            draggable={false}
          />
        ) : (
          <div className="text-white text-lg">No image to display</div>
        )}
      </div>
    </div>
  );
}