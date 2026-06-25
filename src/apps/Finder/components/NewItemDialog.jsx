export default function NewItemDialog({
  showNewItemDialog,
  setShowNewItemDialog,
  newItemType,
  newItemName,
  setNewItemName,
  handleCreateItem,
  isMobile
}) {
  if (!showNewItemDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl p-6 w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <h3 className="text-lg font-semibold mb-4 text-black">
          Create New {newItemType === 'folder' ? 'Folder' : 'Text File'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {newItemType === 'folder' ? 'Folder' : 'File'} Name
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={newItemType === 'folder' ? 'Enter folder name' : 'Enter file name'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateItem()}
              autoFocus
            />
          </div>
        </div>

        <div className={`flex gap-3 mt-6 ${isMobile ? 'flex-col' : ''}`}>
          <button
            onClick={() => {
              setShowNewItemDialog(false);
              setNewItemName('');
            }}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateItem}
            disabled={!newItemName.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
