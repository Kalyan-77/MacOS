// src/state/fs.js

const STORAGE_KEY = "fs_root_v1";

// Node shape: { id, name, type: "folder" | "file", children?, parentId?, ext?, size?, createdAt, updatedAt }

const uid = () => Math.random().toString(36).slice(2, 10);

const now = () => new Date().toISOString();

const seed = () => ({
  id: "root",
  name: "Macintosh HD",
  type: "folder",
  parentId: null,
  createdAt: now(),
  updatedAt: now(),
  children: [
    {
      id: uid(),
      name: "Desktop",
      type: "folder",
      parentId: "root",
      createdAt: now(),
      updatedAt: now(),
      children: [
        { id: uid(), name: "Readme.txt", type: "file", ext: "txt", size: 1234, parentId: null, createdAt: now(), updatedAt: now() },
      ],
    },
    {
      id: uid(),
      name: "Documents",
      type: "folder",
      parentId: "root",
      createdAt: now(),
      updatedAt: now(),
      children: [],
    },
    {
      id: uid(),
      name: "Downloads",
      type: "folder",
      parentId: "root",
      createdAt: now(),
      updatedAt: now(),
      children: [],
    },
    {
      id: uid(),
      name: "Pictures",
      type: "folder",
      parentId: "root",
      createdAt: now(),
      updatedAt: now(),
      children: [],
    },
    {
      id: uid(),
      name: "Music",
      type: "folder",
      parentId: "root",
      createdAt: now(),
      updatedAt: now(),
      children: [],
    },
  ],
});

export function loadFS() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const s = seed();
    saveFS(s);
    return s;
  }
  return JSON.parse(raw);
}

export function saveFS(root) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(root));
}

// DFS helpers
export function findById(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  if (root.type === "folder" && root.children) {
    for (const c of root.children) {
      const found = findById(c, id);
      if (found) return found;
    }
  }
  return null;
}

export function findParent(root, id, parent = null) {
  if (root.id === id) return parent;
  if (root.type === "folder" && root.children) {
    for (const c of root.children) {
      const found = findParent(c, id, root);
      if (found) return found;
    }
  }
  return null;
}

export function listChildren(root, folderId) {
  const node = findById(root, folderId);
  if (!node || node.type !== "folder") return [];
  return node.children || [];
}

export function createFolder(root, folderId, name = "Untitled Folder") {
  const folder = findById(root, folderId);
  if (!folder || folder.type !== "folder") return root;

  // auto-increment if name exists
  const base = name;
  let n = name;
  let i = 1;
  while (folder.children.some((c) => c.name === n)) {
    n = `${base} ${i++}`;
  }

  const node = {
    id: uid(),
    name: n,
    type: "folder",
    parentId: folderId,
    createdAt: now(),
    updatedAt: now(),
    children: [],
  };
  folder.children.push(node);
  folder.updatedAt = now();
  return root;
}

export function renameNode(root, id, newName) {
  const node = findById(root, id);
  if (!node) return root;
  node.name = newName;
  node.updatedAt = now();
  return root;
}

export function deleteNode(root, id) {
  if (id === "root") return root;
  const parent = findParent(root, id);
  if (!parent || !parent.children) return root;
  parent.children = parent.children.filter((c) => c.id !== id);
  parent.updatedAt = now();
  return root;
}

export function addFile(root, folderId, fileObj) {
  const folder = findById(root, folderId);
  if (!folder || folder.type !== "folder") return root;
  const node = {
    id: uid(),
    name: fileObj.name || "New File",
    type: "file",
    ext: (fileObj.name?.split(".").pop() || "").toLowerCase(),
    size: fileObj.size || 0,
    parentId: folderId,
    createdAt: now(),
    updatedAt: now(),
  };
  folder.children.push(node);
  folder.updatedAt = now();
  return root;
}

export function pathTo(root, id) {
  const node = findById(root, id);
  if (!node) return [];
  if (node.id === "root") return [node];
  const parent = findParent(root, id);
  return [...pathTo(root, parent.id), node];
}
