import { useState, useEffect, useRef } from "react";

export default function CreateItemModal({ onClose, onCreate, type = "folder" }) {
  const [itemName, setItemName] = useState(type === "folder" ? "Untitled Folder" : "Untitled.txt");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (itemName.trim()) {
      onCreate(itemName.trim(), type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 select-none" style={{ zIndex: 9999 }}>
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-600">
        <h2 className="text-white text-lg font-semibold mb-4">
          Create New {type === "folder" ? "Folder" : "File"}
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
