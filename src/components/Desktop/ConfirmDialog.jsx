export default function ConfirmDialog({ message, onConfirm, onCancel, danger = false }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 select-none" style={{ zIndex: 9999 }}>
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-600">
        <h2 className="text-white text-lg font-semibold mb-4">Confirm Action</h2>
        <p className="text-gray-300 mb-6 text-sm">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {danger ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
