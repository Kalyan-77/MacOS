import { MoreHorizontal } from 'lucide-react';

export default function FinderTable({
  filteredItems,
  selectedItems,
  isMobile,
  handleItemClick,
  handleItemDoubleClick,
  handleContextMenu,
  getFileIcon,
  formatFileSize,
  formatDate
}) {
  return (
    <div className="space-y-1 w-full select-none">
      {!isMobile && (
        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50">
          <div className="col-span-5">Name</div>
          <div className="col-span-3">Modified</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Type</div>
        </div>
      )}
      {filteredItems.map((item, index) => {
        const Icon = getFileIcon(item.type, item.name);
        const isSelected = selectedItems.includes(item._id);

        return (
          <div
            key={index}
            className={`${
              isMobile ? 'flex items-center gap-3 p-3' : 'grid grid-cols-12 gap-4 items-center px-3 py-2'
            } rounded-md cursor-pointer transition-colors ${
              isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleItemClick(item)}
            onDoubleClick={() => handleItemDoubleClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            {isMobile ? (
              <>
                {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                  <img
                    src={item.thumbnailLink}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <Icon
                    size={24}
                    className={`flex-shrink-0 ${
                      item.type === 'folder' ? 'text-blue-500' :
                      item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                      item.type === 'video' ? 'text-red-500' :
                      item.type === 'music' ? 'text-purple-500' :
                      item.type === 'document' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {item.size && <span>{formatFileSize(item.size)}</span>}
                    <span>{formatDate(item.updatedAt || item.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, item);
                  }}
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                >
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>
              </>
            ) : (
              <>
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  {item.thumbnailLink && (item.type === 'photo' || item.type === 'video') ? (
                    <img
                      src={item.thumbnailLink}
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <Icon
                      size={20}
                      className={`flex-shrink-0 ${
                        item.type === 'folder' ? 'text-blue-500' :
                        item.type === 'image' || item.type === 'photo' ? 'text-green-500' :
                        item.type === 'video' ? 'text-red-500' :
                        item.type === 'music' ? 'text-purple-500' :
                        item.type === 'document' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}
                    />
                  )}
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                </div>
                <div className="col-span-3 text-sm text-gray-600 truncate">
                  {formatDate(item.updatedAt || item.createdAt)}
                </div>
                <div className="col-span-2 text-sm text-gray-600 truncate">
                  {item.size ? formatFileSize(item.size) : '—'}
                </div>
                <div className="col-span-2 flex items-center justify-between min-w-0">
                  <span className="text-sm text-gray-600 capitalize truncate mr-2">{item.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, item);
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  >
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
