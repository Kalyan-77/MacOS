import {
  Home, Monitor, FileText, FileImage, Music, Film, Star, Trash2
} from 'lucide-react';

export default function FinderSidebar({
  currentPath,
  navigateToPath,
  showTrash,
  itemsCount,
  documentCount,
  photoCount,
  videoCount,
  musicCount
}) {
  const sidebarFolders = [
    { icon: Home, name: 'Home', path: ['Home'], id: 'root', color: 'text-blue-500' },
    { icon: Monitor, name: 'Desktop', path: ['Desktop'], id: 'desktop', color: 'text-purple-500' },
    { icon: FileText, name: 'Documents', path: ['Documents'], id: 'documents', color: 'text-blue-500', special: 'documents' },
    { icon: FileImage, name: 'Photos', path: ['Photos'], id: 'photos', color: 'text-pink-500', special: 'photos' },
    { icon: Music, name: 'Music', path: ['Music'], id: 'music', color: 'text-purple-500', special: 'music' },
    { icon: Film, name: 'Videos', path: ['Videos'], id: 'videos', color: 'text-red-500', special: 'videos' },
    { icon: Star, name: 'Favorites', path: ['Favorites'], id: 'favorites', color: 'text-yellow-500' },
    { icon: Trash2, name: 'Trash', path: ['Trash'], id: 'trash', color: 'text-red-500' }
  ];

  return (
    <div className="w-48 bg-gray-50 border-r border-gray-200 p-3 flex flex-col gap-1 flex-shrink-0 select-none">
      <div className="text-xs font-semibold text-gray-400 px-3 py-1 uppercase tracking-wider">
        Favorites
      </div>
      <div className="space-y-0.5">
        {sidebarFolders.map((folder, index) => {
          const Icon = folder.icon;
          const isActive = JSON.stringify(currentPath) === JSON.stringify(folder.path);

          return (
            <button
              key={index}
              onClick={() => navigateToPath(folder)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md text-sm transition-colors ${
                isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <Icon size={18} className={isActive ? 'text-blue-600' : folder.color} />
              <span className="flex-1 truncate">{folder.name}</span>
              {folder.name === 'Trash' && showTrash && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  {itemsCount}
                </span>
              )}
              {folder.name === 'Documents' && documentCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                  {documentCount}
                </span>
              )}
              {folder.name === 'Photos' && photoCount > 0 && (
                <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">
                  {photoCount}
                </span>
              )}
              {folder.name === 'Videos' && videoCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                  {videoCount}
                </span>
              )}
              {folder.name === 'Music' && musicCount > 0 && (
                <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                  {musicCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
