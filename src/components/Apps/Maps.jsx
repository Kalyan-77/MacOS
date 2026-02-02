import { useState } from 'react';
import { Map } from 'lucide-react';

export default function Maps({ onClose }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className="w-full h-full bg-gray-50 relative">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading Maps...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Maps iframe */}
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28492.600538774324!2d82.17856821321708!3d26.789812019659873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a07937e6d2823:0x5fc8f683b17f222b!2sAyodhya,%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1709980884386!5m2!1sen!2sin"
        className="w-full h-full border-0"
        title="Google Maps"
        onLoad={handleIframeLoad}
        allow="clipboard-read; clipboard-write; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />

      {/* Fallback content if iframe fails */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ zIndex: isLoaded ? -1 : 5 }}>
        <div className="text-center p-8">
          <Map size={48} className="text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Google Maps</h2>
          <p className="text-gray-600 mb-4">Click the button below to open Maps in a new tab</p>
          <a
            href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28492.600538774324!2d82.17856821321708!3d26.789812019659873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399a07937e6d2823:0x5fc8f683b17f222b!2sAyodhya,%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1709980884386!5m2!1sen!2sin"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Map size={20} />
            Open Maps
          </a>
          <p className="text-sm text-gray-500 mt-4">
            Maps will open in a new browser tab due to security restrictions
          </p>
        </div>
      </div>
    </div>
  );
}
