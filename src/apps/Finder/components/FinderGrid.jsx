import { MoreHorizontal } from 'lucide-react';

export default function FinderGrid({
  filteredItems,
  selectedItems,
  isMobile,
  handleItemClick,
  handleItemDoubleClick,
  handleContextMenu,
  getFileIcon,
  formatFileSize
}) {
  return (
    <div className={`grid gap-4 ${
      isMobile ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    }`}>
      {filteredItems.map((item, index) => {
        const Icon = getFileIcon(item.type, item.name);
        const isSelected = selectedItems.includes(item._id);

        return (
          <div
            key={index}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 relative group ${
              isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => handleItemClick(item)}
            onDoubleClick={() => handleItemDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <div className="flex flex-col items-center gap-2">
              {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                <img
                  src={item.thumbnailLink}
                  alt={item.name}
                  className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} object-cover rounded`}
                />
              ) : (
                <Icon
                  size={isMobile ? 40 : 48}
                  className={`${
                    item.type === 'folder' ? 'text-blue-500' :
                    item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                    item.type === 'video' ? 'text-red-500' :
                    item.type === 'music' ? 'text-purple-500' :
                    item.type === 'document' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}
                />
              )}
              <div className="text-center w-full">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate w-full`}>
                  {item.name}
                </p>
                {item.size && !isMobile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(item.size)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, item);
              }}
              className="absolute top-2 right-2 p-1 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={14} className="text-gray-600" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
