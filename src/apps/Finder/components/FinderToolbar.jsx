import {
  ArrowUp, Copy, X, Plus, ChevronDown, FolderPlus, FilePlus, Upload, Grid3X3, List, Search
} from 'lucide-react';

export default function FinderToolbar({
  folderHistory,
  goBack,
  isMobile,
  isSearching,
  searchQuery,
  setSearchQuery,
  currentPath,
  clipboard,
  setClipboard,
  showTrash,
  isSpecialFolder,
  showCreateDropdown,
  setShowCreateDropdown,
  createNewItem,
  handleUpload,
  pasteItem,
  handleSearch,
  view,
  setView,
  filteredItemsLength,
  createDropdownRef
}) {
  return (
    <div className={`flex items-center justify-between px-4 ${isMobile ? 'py-3' : 'py-2'} border-b border-gray-200 bg-gray-50 flex-wrap gap-2 select-none`}>
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        {folderHistory.length > 0 && (
          <button
            onClick={goBack}
            className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-black`}
            style={{ cursor: 'pointer' }}
          >
            <ArrowUp size={14} />
            {!isMobile && 'Back'}
          </button>
        )}

        <div className={`flex items-center gap-1 ${isMobile ? 'text-base' : 'text-sm'} text-gray-700 font-medium`}>
          {isSearching ? (
            <span>Search: "{searchQuery}"</span>
          ) : (
            currentPath.map((segment, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <span className="text-gray-400">/</span>}
                <span>{segment}</span>
              </span>
            ))
          )}
        </div>

        {clipboard && !isMobile && (
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">
            <Copy size={12} />
            <span className="truncate max-w-[150px]">
              {clipboard.item.name} ({clipboard.type})
            </span>
            <button
              onClick={() => setClipboard(null)}
              className="hover:bg-purple-200 rounded p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {!showTrash && !isSearching && !isSpecialFolder && (
          <>
            <div className="relative" ref={createDropdownRef}>
              <button
                onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors`}
                style={{ cursor: 'pointer' }}
              >
                <Plus size={14} />
                {!isMobile && 'New'}
                <ChevronDown size={12} />
              </button>

              {showCreateDropdown && (
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => createNewItem('folder')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                    style={{ cursor: 'pointer' }}
                  >
                    <FolderPlus size={16} className="text-blue-500" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => createNewItem('file')}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                    style={{ cursor: 'pointer' }}
                  >
                    <FilePlus size={16} className="text-green-500" />
                    <span>New Text File</span>
                  </button>
                </div>
              )}
            </div>

            <label className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-green-500 text-white rounded-md hover:bg-green-600 cursor-pointer transition-colors`}>
              <Upload size={14} />
              {!isMobile && 'Upload'}
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </>
        )}

        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery('');
              handleSearch();
            }}
            className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors`}
            style={{ cursor: 'pointer' }}
          >
            <X size={14} />
            Clear Search
          </button>
        )}

        {clipboard && (
          <button
            onClick={pasteItem}
            className={`flex items-center gap-1 px-3 ${isMobile ? 'py-2' : 'py-1.5'} text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors`}
            style={{ cursor: 'pointer' }}
            title={`Paste "${clipboard.item.name}"`}
          >
            {!isMobile && `Paste ${clipboard.type === 'cut' ? '(Move)' : '(Copy)'}`}
            {isMobile && <Copy size={14} />}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isMobile && (
          <>
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded transition-colors ${
                view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded transition-colors ${
                view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <List size={16} />
            </button>

            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-32 sm:w-48 text-black placeholder-gray-600"
                style={{ cursor: 'text' }}
              />
            </div>
          </>
        )}

        {isMobile && (
          <div className="flex gap-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded transition-colors ${
                view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded transition-colors ${
                view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-600'
              }`}
              style={{ cursor: 'pointer' }}
            >
              <List size={16} />
            </button>
          </div>
        )}

        <div className="text-sm text-gray-600">
          {filteredItemsLength} {filteredItemsLength === 1 ? 'item' : 'items'}
        </div>
      </div>
    </div>
  );
}
