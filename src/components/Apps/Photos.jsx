import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { BASE_URL } from '../../../config';

export default function Photos({ fileToOpen = null, userId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [fileName, setFileName] = useState('Untitled Image');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const imageRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

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

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-gray-700">
            {fileName}
            {isLoading && ' (Loading...)'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={isLoading || zoom <= 0.5}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-black"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-black min-w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={isLoading || zoom >= 3}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-black"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleRotate}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 disabled:opacity-50 text-black"
            title="Rotate"
          >
            <RotateCw size={14} />
          </button>
          <button
            onClick={handleFitToScreen}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-150 disabled:opacity-50 text-black"
            title="Fit to Screen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden relative">
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