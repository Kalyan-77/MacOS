// import { useState, useRef, useEffect } from 'react';
// import { X, Minus, Square, Terminal, Folder, Search, Settings } from 'lucide-react';

// export default function TerminalTab({ onClose }) {
//   // Terminal state
//   const [currentDirectory, setCurrentDirectory] = useState('/home/user');
//   const [history, setHistory] = useState([
//     { type: 'output', content: 'Welcome to Linux Terminal Emulator v1.0' },
//     { type: 'output', content: 'Type "help" to see available commands' }
//   ]);
//   const [currentCommand, setCurrentCommand] = useState('');
//   const [commandHistory, setCommandHistory] = useState([]);
//   const [historyIndex, setHistoryIndex] = useState(-1);
//   const [username] = useState('user');
//   const [hostname] = useState('linux-terminal');
  
//   // File system state
//   const [fileSystem, setFileSystem] = useState({
//     '/': {
//       type: 'directory',
//       contents: {
//         'home': {
//           type: 'directory',
//           contents: {
//             'user': {
//               type: 'directory',
//               contents: {
//                 'Documents': { type: 'directory', contents: {
//                   'readme.txt': { type: 'file', content: 'Welcome to the Linux Terminal!\nThis is a fully functional terminal emulator.' },
//                   'notes.md': { type: 'file', content: '# My Notes\n\n- Learn Linux commands\n- Practice terminal skills\n- Build cool projects' }
//                 }},
//                 'Downloads': { type: 'directory', contents: {} },
//                 'Pictures': { type: 'directory', contents: {
//                   'wallpaper.jpg': { type: 'file', content: 'Binary image data...' }
//                 }},
//                 'Music': { type: 'directory', contents: {} },
//                 'Desktop': { type: 'directory', contents: {
//                   'script.sh': { type: 'file', content: '#!/bin/bash\necho "Hello World!"' }
//                 }},
//                 '.bashrc': { type: 'file', content: '# .bashrc\nexport PS1="\\u@\\h:\\w$ "' },
//                 'test.py': { type: 'file', content: '#!/usr/bin/env python3\nprint("Hello from Python!")' }
//               }
//             }
//           }
//         },
//         'etc': {
//           type: 'directory',
//           contents: {
//             'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash' },
//             'hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-terminal' }
//           }
//         },
//         'var': {
//           type: 'directory',
//           contents: {
//             'log': { type: 'directory', contents: {} },
//             'tmp': { type: 'directory', contents: {} }
//           }
//         },
//         'usr': {
//           type: 'directory',
//           contents: {
//             'bin': { type: 'directory', contents: {} },
//             'lib': { type: 'directory', contents: {} }
//           }
//         }
//       }
//     }
//   });

//   // Window state
//   const [isMinimized, setIsMinimized] = useState(false);
//   const [isMaximized, setIsMaximized] = useState(false);
//   const [prevPosition, setPrevPosition] = useState({ x: 200, y: 100 });
//   const [isActive, setIsActive] = useState(true);
//   const [isDragging, setIsDragging] = useState(false);
  
//   const windowRef = useRef(null);
//   const terminalRef = useRef(null);
//   const inputRef = useRef(null);

//   // Dragging variables
//   const dragState = useRef({
//     holdingWindow: false,
//     mouseTouchX: 0,
//     mouseTouchY: 0,
//     startWindowX: 200,
//     startWindowY: 100,
//     currentWindowX: 300,
//     currentWindowY: 50
//   });

//   // File system utilities
//   const resolvePath = (path) => {
//     if (path.startsWith('/')) {
//       return path;
//     }
//     return currentDirectory === '/' ? `/${path}` : `${currentDirectory}/${path}`;
//   };

//   const getPathSegments = (path) => {
//     return path.split('/').filter(segment => segment !== '');
//   };

//   const navigateToPath = (fs, pathSegments) => {
//     let current = fs['/'];
//     for (const segment of pathSegments) {
//       if (current.type === 'directory' && current.contents[segment]) {
//         current = current.contents[segment];
//       } else {
//         return null;
//       }
//     }
//     return current;
//   };

//   const getDirectoryContents = (path) => {
//     const segments = getPathSegments(path);
//     const dir = navigateToPath(fileSystem, segments);
//     return dir && dir.type === 'directory' ? dir.contents : null;
//   };

//   const getFileContent = (path) => {
//     const segments = getPathSegments(path);
//     const file = navigateToPath(fileSystem, segments);
//     return file && file.type === 'file' ? file.content : null;
//   };

//   const pathExists = (path) => {
//     const segments = getPathSegments(path);
//     return navigateToPath(fileSystem, segments) !== null;
//   };

//   const isDirectory = (path) => {
//     const segments = getPathSegments(path);
//     const item = navigateToPath(fileSystem, segments);
//     return item && item.type === 'directory';
//   };

//   const createFile = (path, content = '') => {
//     const segments = getPathSegments(path);
//     const fileName = segments.pop();
//     const dirPath = '/' + segments.join('/');
    
//     setFileSystem(prev => {
//       const newFs = JSON.parse(JSON.stringify(prev));
//       const dir = navigateToPath(newFs, segments);
//       if (dir && dir.type === 'directory') {
//         dir.contents[fileName] = { type: 'file', content };
//         return newFs;
//       }
//       return prev;
//     });
//   };

//   const createDirectory = (path) => {
//     const segments = getPathSegments(path);
//     const dirName = segments.pop();
//     const parentPath = '/' + segments.join('/');
    
//     setFileSystem(prev => {
//       const newFs = JSON.parse(JSON.stringify(prev));
//       const parent = navigateToPath(newFs, segments);
//       if (parent && parent.type === 'directory') {
//         parent.contents[dirName] = { type: 'directory', contents: {} };
//         return newFs;
//       }
//       return prev;
//     });
//   };

//   const removeItem = (path) => {
//     const segments = getPathSegments(path);
//     const itemName = segments.pop();
    
//     setFileSystem(prev => {
//       const newFs = JSON.parse(JSON.stringify(prev));
//       const parent = navigateToPath(newFs, segments);
//       if (parent && parent.type === 'directory' && parent.contents[itemName]) {
//         delete parent.contents[itemName];
//         return newFs;
//       }
//       return prev;
//     });
//   };

//   // Command implementations
//   const commands = {
//     help: () => {
//       return `Available commands:
//   ls [path]          - list directory contents
//   cd <path>          - change directory
//   pwd                - print working directory
//   cat <file>         - display file content
//   mkdir <dir>        - create directory
//   touch <file>       - create empty file
//   rm <file>          - remove file
//   rmdir <dir>        - remove empty directory
//   echo <text>        - print text
//   clear              - clear terminal
//   whoami             - display current user
//   hostname           - display system hostname
//   date               - display current date
//   uname              - display system information
//   history            - show command history
//   grep <pattern> <file> - search for pattern in file
//   head <file>        - show first 10 lines of file
//   tail <file>        - show last 10 lines of file
//   wc <file>          - word, line, character count
//   find <path> -name <pattern> - find files by name
//   ps                 - show running processes (simulated)
//   uptime             - show system uptime (simulated)
//   tree [path]        - display directory tree structure
//   chmod <mode> <file> - change file permissions (simulated)
//   df                 - display filesystem disk space usage
//   free               - display memory usage
//   top                - display running processes
//   ping <host>        - ping a host (simulated)
//   wget <url>         - download a file (simulated)
//   sudo <command>     - run command as superuser (simulated)
//   man <command>      - display manual page for command`;
//     },

//     ls: (args) => {
//       const path = args.length > 0 ? resolvePath(args[0]) : currentDirectory;
//       const contents = getDirectoryContents(path);
      
//       if (!contents) {
//         return `ls: cannot access '${path}': No such file or directory`;
//       }

//       const items = Object.entries(contents).map(([name, item]) => {
//         return item.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name;
//       });

//       return items.length > 0 ? items.join('  ') : '';
//     },

//     cd: (args) => {
//       if (args.length === 0) {
//         setCurrentDirectory('/home/user');
//         return '';
//       }

//       let newPath = args[0];
      
//       if (newPath === '..') {
//         const segments = currentDirectory.split('/').filter(s => s);
//         segments.pop();
//         newPath = segments.length > 0 ? '/' + segments.join('/') : '/';
//       } else if (newPath === '.') {
//         return '';
//       } else if (!newPath.startsWith('/')) {
//         newPath = currentDirectory === '/' ? `/${newPath}` : `${currentDirectory}/${newPath}`;
//       }

//       if (isDirectory(newPath)) {
//         setCurrentDirectory(newPath);
//         return '';
//       } else {
//         return `cd: ${args[0]}: No such file or directory`;
//       }
//     },

//     pwd: () => currentDirectory,

//     cat: (args) => {
//       if (args.length === 0) {
//         return 'cat: missing file operand';
//       }

//       const path = resolvePath(args[0]);
//       const content = getFileContent(path);
      
//       if (content === null) {
//         return `cat: ${args[0]}: No such file or directory`;
//       }

//       return content;
//     },

//     mkdir: (args) => {
//       if (args.length === 0) {
//         return 'mkdir: missing operand';
//       }

//       const path = resolvePath(args[0]);
      
//       if (pathExists(path)) {
//         return `mkdir: cannot create directory '${args[0]}': File exists`;
//       }

//       createDirectory(path);
//       return '';
//     },

//     touch: (args) => {
//       if (args.length === 0) {
//         return 'touch: missing file operand';
//       }

//       const path = resolvePath(args[0]);
      
//       if (pathExists(path)) {
//         return ''; // File already exists, just update timestamp (simulated)
//       }

//       createFile(path);
//       return '';
//     },

//     rm: (args) => {
//       if (args.length === 0) {
//         return 'rm: missing operand';
//       }

//       const path = resolvePath(args[0]);
      
//       if (!pathExists(path)) {
//         return `rm: cannot remove '${args[0]}': No such file or directory`;
//       }

//       if (isDirectory(path)) {
//         return `rm: cannot remove '${args[0]}': Is a directory`;
//       }

//       removeItem(path);
//       return '';
//     },

//     rmdir: (args) => {
//       if (args.length === 0) {
//         return 'rmdir: missing operand';
//       }

//       const path = resolvePath(args[0]);
      
//       if (!pathExists(path)) {
//         return `rmdir: failed to remove '${args[0]}': No such file or directory`;
//       }

//       if (!isDirectory(path)) {
//         return `rmdir: failed to remove '${args[0]}': Not a directory`;
//       }

//       const contents = getDirectoryContents(path);
//       if (Object.keys(contents).length > 0) {
//         return `rmdir: failed to remove '${args[0]}': Directory not empty`;
//       }

//       removeItem(path);
//       return '';
//     },

//     echo: (args) => args.join(' '),

//     clear: () => {
//       setHistory([]);
//       return '';
//     },

//     whoami: () => username,

//     hostname: () => hostname,

//     date: () => new Date().toString(),

//     uname: (args) => {
//       if (args.includes('-a')) {
//         return 'Linux linux-terminal 5.4.0-generic #47-Ubuntu SMP x86_64 GNU/Linux';
//       }
//       return 'Linux';
//     },

//     history: () => {
//       return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
//     },

//     grep: (args) => {
//       if (args.length < 2) {
//         return 'grep: missing operand';
//       }

//       const pattern = args[0];
//       const path = resolvePath(args[1]);
//       const content = getFileContent(path);

//       if (content === null) {
//         return `grep: ${args[1]}: No such file or directory`;
//       }

//       const lines = content.split('\n');
//       const matches = lines.filter(line => line.includes(pattern));
//       return matches.join('\n');
//     },

//     head: (args) => {
//       if (args.length === 0) {
//         return 'head: missing file operand';
//       }

//       const path = resolvePath(args[0]);
//       const content = getFileContent(path);

//       if (content === null) {
//         return `head: cannot open '${args[0]}' for reading: No such file or directory`;
//       }

//       const lines = content.split('\n');
//       return lines.slice(0, 10).join('\n');
//     },

//     tail: (args) => {
//       if (args.length === 0) {
//         return 'tail: missing file operand';
//       }

//       const path = resolvePath(args[0]);
//       const content = getFileContent(path);

//       if (content === null) {
//         return `tail: cannot open '${args[0]}' for reading: No such file or directory`;
//       }

//       const lines = content.split('\n');
//       return lines.slice(-10).join('\n');
//     },

//     wc: (args) => {
//       if (args.length === 0) {
//         return 'wc: missing file operand';
//       }

//       const path = resolvePath(args[0]);
//       const content = getFileContent(path);

//       if (content === null) {
//         return `wc: ${args[0]}: No such file or directory`;
//       }

//       const lines = content.split('\n').length;
//       const words = content.split(/\s+/).filter(w => w).length;
//       const chars = content.length;

//       return `${lines} ${words} ${chars} ${args[0]}`;
//     },

//     find: (args) => {
//       if (args.length < 3 || args[1] !== '-name') {
//         return 'find: invalid usage. Use: find <path> -name <pattern>';
//       }

//       const searchPath = resolvePath(args[0]);
//       const pattern = args[2];
//       const results = [];

//       const searchRecursive = (path, contents) => {
//         Object.entries(contents).forEach(([name, item]) => {
//           const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
          
//           if (name.includes(pattern)) {
//             results.push(fullPath);
//           }
          
//           if (item.type === 'directory') {
//             searchRecursive(fullPath, item.contents);
//           }
//         });
//       };

//       const contents = getDirectoryContents(searchPath);
//       if (contents) {
//         searchRecursive(searchPath, contents);
//       }

//       return results.join('\n');
//     },

//     ps: () => {
//       return `  PID TTY          TIME CMD
//  1234 pts/0    00:00:00 bash
//  5678 pts/0    00:00:00 terminal
//  9012 pts/0    00:00:00 ps`;
//     },

//     uptime: () => {
//       const uptime = Math.floor(Math.random() * 86400);
//       const hours = Math.floor(uptime / 3600);
//       const minutes = Math.floor((uptime % 3600) / 60);
//       return `up ${hours}:${minutes.toString().padStart(2, '0')}, 1 user, load average: 0.12, 0.08, 0.05`;
//     },

//     tree: (args) => {
//       const path = args.length > 0 ? resolvePath(args[0]) : currentDirectory;
//       const contents = getDirectoryContents(path);
      
//       if (!contents) {
//         return `tree: ${path}: No such file or directory`;
//       }

//       let output = path + '\n';
//       const buildTree = (contents, prefix = '') => {
//         const entries = Object.entries(contents);
//         entries.forEach(([name, item], index) => {
//           const isLast = index === entries.length - 1;
//           const connector = isLast ? '└── ' : '├── ';
//           const nextPrefix = prefix + (isLast ? '    ' : '│   ');
          
//           output += prefix + connector + (item.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name) + '\n';
          
//           if (item.type === 'directory') {
//             buildTree(item.contents, nextPrefix);
//           }
//         });
//       };
      
//       buildTree(contents);
//       return output.slice(0, -1); // Remove trailing newline
//     },

//     chmod: (args) => {
//       if (args.length < 2) {
//         return 'chmod: missing operand';
//       }
//       return `chmod: changed permissions of '${args[1]}' to ${args[0]}`;
//     },

//     df: () => {
//       return `Filesystem     1K-blocks    Used Available Use% Mounted on
// /dev/sda1        8123456 4567890   3555566  57% /
// tmpfs             512000       0    512000   0% /dev/shm
// /dev/sda2        1048576  204800    843776  20% /home`;
//     },

//     free: () => {
//       return `              total        used        free      shared  buff/cache   available
// Mem:        8165432     3456789     2345678       12345     2362965     4234567
// Swap:       2097152      567890     1529262`;
//     },

//     top: () => {
//       return `top - 14:32:15 up 2:17, 1 user, load average: 0.08, 0.12, 0.05
// Tasks: 127 total,   1 running, 126 sleeping,   0 stopped,   0 zombie
// %Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
// MiB Mem :   7973.9 total,   2345.6 free,   3567.8 used,   2060.5 buff/cache
// MiB Swap:   2048.0 total,   1492.4 free,    555.6 used.   4134.5 avail Mem

//   PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
//  1234 user      20   0  123456  45678  12345 S   5.2   2.3   1:23.45 terminal
//  5678 root      20   0   67890  23456   7890 S   2.1   1.2   0:45.67 systemd`;
//     },

//     ping: (args) => {
//       if (args.length === 0) {
//         return 'ping: missing host operand';
//       }
      
//       const host = args[0];
//       return `PING ${host} (127.0.0.1) 56(84) bytes of data.
// 64 bytes from ${host} (127.0.0.1): icmp_seq=1 ttl=64 time=0.123 ms
// 64 bytes from ${host} (127.0.0.1): icmp_seq=2 ttl=64 time=0.156 ms
// 64 bytes from ${host} (127.0.0.1): icmp_seq=3 ttl=64 time=0.098 ms

// --- ${host} ping statistics ---
// 3 packets transmitted, 3 received, 0% packet loss, time 2003ms
// rtt min/avg/max/mdev = 0.098/0.125/0.156/0.024 ms`;
//     },

//     wget: (args) => {
//       if (args.length === 0) {
//         return 'wget: missing URL';
//       }
      
//       const url = args[0];
//       const filename = url.split('/').pop() || 'index.html';
      
//       createFile(resolvePath(filename), `Downloaded content from ${url}`);
      
//       return `--2025-08-23 14:32:15--  ${url}
// Resolving example.com (example.com)... 93.184.216.34
// Connecting to example.com (example.com)|93.184.216.34|:80... connected.
// HTTP request sent, awaiting response... 200 OK
// Length: 1024 (1.0K) [text/html]
// Saving to: '${filename}'

// ${filename}      100%[===================>]   1.00K  --.-KB/s    in 0s

// 2025-08-23 14:32:15 (12.5 MB/s) - '${filename}' saved [1024/1024]`;
//     },

//     sudo: (args) => {
//       if (args.length === 0) {
//         return 'sudo: a command must be specified';
//       }
      
//       const command = args[0];
//       const restArgs = args.slice(1);
      
//       if (commands[command]) {
//         return `[sudo] password for ${username}: \n` + commands[command](restArgs);
//       } else {
//         return `sudo: ${command}: command not found`;
//       }
//     },

//     man: (args) => {
//       if (args.length === 0) {
//         return 'man: missing operand';
//       }
      
//       const command = args[0];
      
//       const manPages = {
//         ls: `NAME
//        ls - list directory contents

// SYNOPSIS
//        ls [OPTION]... [FILE]...

// DESCRIPTION
//        List information about the FILEs (the current directory by default).`,
        
//         cd: `NAME
//        cd - change directory

// SYNOPSIS
//        cd [DIRECTORY]

// DESCRIPTION
//        Change the current working directory to DIRECTORY.`,
        
//         cat: `NAME
//        cat - concatenate files and print on the standard output

// SYNOPSIS
//        cat [OPTION]... [FILE]...

// DESCRIPTION
//        Concatenate FILE(s), or standard input, to standard output.`,
        
//         help: `NAME
//        help - display help information

// SYNOPSIS
//        help

// DESCRIPTION
//        Display available commands and their descriptions.`
//       };
      
//       return manPages[command] || `No manual entry for ${command}`;
//     }
//   };

//   // Execute command
//   const executeCommand = (input) => {
//     const trimmedInput = input.trim();
    
//     if (!trimmedInput) return '';

//     const [command, ...args] = trimmedInput.split(' ').filter(arg => arg);
    
//     if (commands[command]) {
//       return commands[command](args);
//     } else {
//       return `${command}: command not found`;
//     }
//   };

//   // Handle command submission
//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!currentCommand.trim()) return;

//     const output = executeCommand(currentCommand);
    
//     setHistory(prev => [
//       ...prev,
//       { type: 'command', content: `${username}@${hostname}:${currentDirectory}$ ${currentCommand}` },
//       ...(output ? [{ type: 'output', content: output }] : [])
//     ]);
    
//     setCommandHistory(prev => [...prev, currentCommand]);
//     setCurrentCommand('');
//     setHistoryIndex(-1);
//   };

//   // Handle key events
//   const handleKeyDown = (e) => {
//     if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       if (commandHistory.length > 0) {
//         const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
//         setHistoryIndex(newIndex);
//         setCurrentCommand(commandHistory[newIndex]);
//       }
//     } else if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       if (historyIndex !== -1) {
//         const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
//         setHistoryIndex(newIndex);
//         setCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
//       }
//     } else if (e.key === 'Tab') {
//       e.preventDefault();
//       // Simple tab completion for commands and files
//       const words = currentCommand.split(' ');
//       const currentWord = words[words.length - 1];
      
//       if (words.length === 1) {
//         // Complete command
//         const matchingCommands = Object.keys(commands).filter(cmd => cmd.startsWith(currentWord));
//         if (matchingCommands.length === 1) {
//           setCurrentCommand(matchingCommands[0] + ' ');
//         }
//       } else {
//         // Complete file/directory names
//         const contents = getDirectoryContents(currentDirectory);
//         if (contents) {
//           const matchingItems = Object.keys(contents).filter(item => item.startsWith(currentWord));
//           if (matchingItems.length === 1) {
//             words[words.length - 1] = matchingItems[0];
//             setCurrentCommand(words.join(' ') + ' ');
//           }
//         }
//       }
//     } else if (e.ctrlKey && e.key === 'c') {
//       e.preventDefault();
//       setCurrentCommand('');
//       setHistory(prev => [
//         ...prev,
//         { type: 'command', content: `${username}@${hostname}:${currentDirectory}$ ${currentCommand}^C` }
//       ]);
//     }
//   };

//   // Auto-scroll to bottom
//   useEffect(() => {
//     if (terminalRef.current) {
//       terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
//     }
//   }, [history]);

//   // Focus input when terminal is clicked
//   useEffect(() => {
//     if (inputRef.current && isActive) {
//       inputRef.current.focus();
//     }
//   }, [isActive, history]);

//   // Initialize dragging system
//   useEffect(() => {
//     const windowElement = windowRef.current;
//     if (!windowElement) return;

//     let highestZ = 1000;
//     let animationFrame = null;

//     const handleMouseMove = (e) => {
//       if (dragState.current.holdingWindow && !isMaximized) {
//         if (animationFrame) {
//           cancelAnimationFrame(animationFrame);
//         }

//         const deltaX = e.clientX - dragState.current.mouseTouchX;
//         const deltaY = e.clientY - dragState.current.mouseTouchY;
        
//         dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
//         dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

//         const minX = -windowElement.offsetWidth + 100;
//         const minY = 0;
//         const maxX = window.innerWidth - 100;
//         const maxY = window.innerHeight - 100;

//         dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
//         dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

//         animationFrame = requestAnimationFrame(() => {
//           windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//         });
//       }
//     };

//     const handleMouseDown = (e) => {
//       if (e.button === 0) {
//         const titleBar = e.target.closest('.title-bar');
//         const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
//         if (titleBar && !isButton) {
//           e.preventDefault();
//           e.stopPropagation();
          
//           dragState.current.holdingWindow = true;
//           setIsActive(true);
//           setIsDragging(true);

//           windowElement.style.zIndex = highestZ;
//           highestZ += 1;

//           dragState.current.mouseTouchX = e.clientX;
//           dragState.current.mouseTouchY = e.clientY;
//           dragState.current.startWindowX = dragState.current.currentWindowX;
//           dragState.current.startWindowY = dragState.current.currentWindowY;

//           document.body.style.userSelect = 'none';
//           document.body.style.cursor = 'default';
//           document.body.style.pointerEvents = 'none';
//           windowElement.style.pointerEvents = 'auto';
//         }
//       }
//     };

//     const handleMouseUp = (e) => {
//       if (dragState.current.holdingWindow) {
//         dragState.current.holdingWindow = false;
//         setIsDragging(false);
        
//         document.body.style.userSelect = '';
//         document.body.style.cursor = '';
//         document.body.style.pointerEvents = '';
//         windowElement.style.pointerEvents = '';

//         if (animationFrame) {
//           cancelAnimationFrame(animationFrame);
//           animationFrame = null;
//         }
//       }
//     };

//     const handleContextMenu = (e) => {
//       if (dragState.current.holdingWindow) {
//         e.preventDefault();
//       }
//     };

//     document.addEventListener('mousemove', handleMouseMove, { passive: false });
//     document.addEventListener('mouseup', handleMouseUp);
//     document.addEventListener('contextmenu', handleContextMenu);
//     windowElement.addEventListener('mousedown', handleMouseDown);

//     windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//     windowElement.style.willChange = 'transform';

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//       document.removeEventListener('contextmenu', handleContextMenu);
//       windowElement.removeEventListener('mousedown', handleMouseDown);
      
//       document.body.style.userSelect = '';
//       document.body.style.cursor = '';
//       document.body.style.pointerEvents = '';
      
//       if (animationFrame) {
//         cancelAnimationFrame(animationFrame);
//       }
//     };
//   }, [isMaximized]);

//   // Traffic light handlers
//   const handleClose = () => {
//     onClose();
//   };

//   const handleMinimize = () => {
//     setIsMinimized(!isMinimized);
//   };

//   const handleMaximize = () => {
//     if (isMaximized) {
//       setIsMaximized(false);
//       dragState.current.currentWindowX = prevPosition.x;
//       dragState.current.currentWindowY = prevPosition.y;
//       windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
//     } else {
//       setPrevPosition({
//         x: dragState.current.currentWindowX,
//         y: dragState.current.currentWindowY
//       });
//       setIsMaximized(true);
//       dragState.current.currentWindowX = 0;
//       dragState.current.currentWindowY = 25;
//       windowRef.current.style.transform = `translate3d(0px, 25px, 0)`;
//     }
//   };

//   const handleWindowClick = () => {
//     setIsActive(true);
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   };

//   return (
//     <div
//       ref={windowRef}
//       className={`fixed bg-gray-900 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ${
//         isActive ? 'ring-2 ring-blue-500/20' : ''
//       } ${
//         isMinimized ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
//       }`}
//       style={{
//         left: 0,
//         top: 0,
//         width: isMaximized ? '100vw' : '1000px',
//         height: isMaximized ? 'calc(100vh - 25px)' : '600px',
//         zIndex: isActive ? 1000 : 999,
//         display: isMinimized ? 'none' : 'block',
//         willChange: isDragging ? 'transform' : 'auto',
//         transition: isDragging ? 'none' : 'all 0.2s'
//       }}
//       onClick={handleWindowClick}
//     >
//       {/* Title Bar */}
//       <div
//         className={`title-bar h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 select-none transition-colors duration-200 ${
//           isActive ? 'bg-gray-800' : 'bg-gray-850'
//         }`}
//         style={{ 
//           cursor: 'default',
//           WebkitAppRegion: 'drag'
//         }}
//       >
//         {/* Traffic Light Buttons */}
//         <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
//           <button
//             className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleClose}
//             title="Close"
//             style={{ cursor: 'pointer' }}
//           >
//             <X size={8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
//           </button>
//           <button
//             className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleMinimize}
//             title="Minimize"
//             style={{ cursor: 'pointer' }}
//           >
//             <Minus size={8} className="text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
//           </button>
//           <button
//             className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
//             onClick={handleMaximize}
//             title={isMaximized ? "Restore" : "Maximize"}
//             style={{ cursor: 'pointer' }}
//           >
//             <Square size={6} className="text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
//           </button>
//         </div>

//         {/* Window Title */}
//         <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
//           <h1 className="text-sm font-medium text-gray-300 flex items-center gap-2">
//             <Terminal size={16} />
//             Terminal - {username}@{hostname}:{currentDirectory}
//           </h1>
//         </div>

//         {/* Toolbar Icons */}
//         <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
//           <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
//             <Folder size={16} className="text-gray-400" />
//           </button>
//           <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
//             <Search size={16} className="text-gray-400" />
//           </button>
//           <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
//             <Settings size={16} className="text-gray-400" />
//           </button>
//         </div>
//       </div>

//       {/* Terminal Content */}
//       <div 
//         ref={terminalRef}
//         className="h-full bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto"
//         style={{ 
//           height: 'calc(100% - 3rem)',
//           scrollbarWidth: 'thin',
//           scrollbarColor: '#4a5568 #1a202c'
//         }}
//       >
//         {/* History */}
//         {history.map((entry, index) => (
//           <div key={index} className="mb-1">
//             {entry.type === 'command' ? (
//               <div className="text-green-400">{entry.content}</div>
//             ) : (
//               <pre className="text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{
//                 __html: entry.content
//                   .replace(/\x1b\[34m(.*?)\x1b\[0m/g, '<span class="text-blue-400">$1</span>')
//                   .replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span class="text-red-400">$1</span>')
//                   .replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span class="text-yellow-400">$1</span>')
//               }} />
//             )}
//           </div>
//         ))}

//         {/* Current Command Line */}
//         <form onSubmit={handleSubmit} className="flex items-center">
//           <span className="text-green-400 mr-2 shrink-0">
//             {username}@{hostname}:{currentDirectory}$
//           </span>
//           <input
//             ref={inputRef}
//             type="text"
//             value={currentCommand}
//             onChange={(e) => setCurrentCommand(e.target.value)}
//             onKeyDown={handleKeyDown}
//             className="flex-1 bg-transparent text-green-400 border-none outline-none font-mono"
//             style={{ cursor: 'text' }}
//             autoFocus
//           />
//         </form>
//       </div>
//     </div>
//   );
// }


//after responsive
import { useState, useRef, useEffect } from 'react';
import { X, Minus, Square, Terminal, Folder, Search, Settings } from 'lucide-react';

export default function TerminalTab({ onClose }) {
  // Terminal state
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [history, setHistory] = useState([
    { type: 'output', content: 'Welcome to Linux Terminal Emulator v1.0' },
    { type: 'output', content: 'Type "help" to see available commands' }
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [username] = useState('user');
  const [hostname] = useState('linux-terminal');
  
  // File system state
  const [fileSystem, setFileSystem] = useState({
    '/': {
      type: 'directory',
      contents: {
        'home': {
          type: 'directory',
          contents: {
            'user': {
              type: 'directory',
              contents: {
                'Documents': { type: 'directory', contents: {
                  'readme.txt': { type: 'file', content: 'Welcome to the Linux Terminal!\nThis is a fully functional terminal emulator.' },
                  'notes.md': { type: 'file', content: '# My Notes\n\n- Learn Linux commands\n- Practice terminal skills\n- Build cool projects' }
                }},
                'Downloads': { type: 'directory', contents: {} },
                'Pictures': { type: 'directory', contents: {
                  'wallpaper.jpg': { type: 'file', content: 'Binary image data...' }
                }},
                'Music': { type: 'directory', contents: {} },
                'Desktop': { type: 'directory', contents: {
                  'script.sh': { type: 'file', content: '#!/bin/bash\necho "Hello World!"' }
                }},
                '.bashrc': { type: 'file', content: '# .bashrc\nexport PS1="\\u@\\h:\\w$ "' },
                'test.py': { type: 'file', content: '#!/usr/bin/env python3\nprint("Hello from Python!")' }
              }
            }
          }
        },
        'etc': {
          type: 'directory',
          contents: {
            'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash' },
            'hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-terminal' }
          }
        },
        'var': {
          type: 'directory',
          contents: {
            'log': { type: 'directory', contents: {} },
            'tmp': { type: 'directory', contents: {} }
          }
        },
        'usr': {
          type: 'directory',
          contents: {
            'bin': { type: 'directory', contents: {} },
            'lib': { type: 'directory', contents: {} }
          }
        }
      }
    }
  });

  // Window state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const windowRef = useRef(null);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Dragging variables
  const dragState = useRef({
    holdingWindow: false,
    mouseTouchX: 0,
    mouseTouchY: 0,
    startWindowX: 50,
    startWindowY: 50,
    currentWindowX: 50,
    currentWindowY: 50
  });

  // Check if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      
      // Auto-maximize on mobile
      if (isMobileDevice && !isMaximized) {
        setIsMaximized(true);
        dragState.current.currentWindowX = 0;
        dragState.current.currentWindowY = 0;
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // File system utilities
  const resolvePath = (path) => {
    if (path.startsWith('/')) {
      return path;
    }
    return currentDirectory === '/' ? `/${path}` : `${currentDirectory}/${path}`;
  };

  const getPathSegments = (path) => {
    return path.split('/').filter(segment => segment !== '');
  };

  const navigateToPath = (fs, pathSegments) => {
    let current = fs['/'];
    for (const segment of pathSegments) {
      if (current.type === 'directory' && current.contents[segment]) {
        current = current.contents[segment];
      } else {
        return null;
      }
    }
    return current;
  };

  const getDirectoryContents = (path) => {
    const segments = getPathSegments(path);
    const dir = navigateToPath(fileSystem, segments);
    return dir && dir.type === 'directory' ? dir.contents : null;
  };

  const getFileContent = (path) => {
    const segments = getPathSegments(path);
    const file = navigateToPath(fileSystem, segments);
    return file && file.type === 'file' ? file.content : null;
  };

  const pathExists = (path) => {
    const segments = getPathSegments(path);
    return navigateToPath(fileSystem, segments) !== null;
  };

  const isDirectory = (path) => {
    const segments = getPathSegments(path);
    const item = navigateToPath(fileSystem, segments);
    return item && item.type === 'directory';
  };

  const createFile = (path, content = '') => {
    const segments = getPathSegments(path);
    const fileName = segments.pop();
    const dirPath = '/' + segments.join('/');
    
    setFileSystem(prev => {
      const newFs = JSON.parse(JSON.stringify(prev));
      const dir = navigateToPath(newFs, segments);
      if (dir && dir.type === 'directory') {
        dir.contents[fileName] = { type: 'file', content };
        return newFs;
      }
      return prev;
    });
  };

  const createDirectory = (path) => {
    const segments = getPathSegments(path);
    const dirName = segments.pop();
    const parentPath = '/' + segments.join('/');
    
    setFileSystem(prev => {
      const newFs = JSON.parse(JSON.stringify(prev));
      const parent = navigateToPath(newFs, segments);
      if (parent && parent.type === 'directory') {
        parent.contents[dirName] = { type: 'directory', contents: {} };
        return newFs;
      }
      return prev;
    });
  };

  const removeItem = (path) => {
    const segments = getPathSegments(path);
    const itemName = segments.pop();
    
    setFileSystem(prev => {
      const newFs = JSON.parse(JSON.stringify(prev));
      const parent = navigateToPath(newFs, segments);
      if (parent && parent.type === 'directory' && parent.contents[itemName]) {
        delete parent.contents[itemName];
        return newFs;
      }
      return prev;
    });
  };

  // Command implementations
  const commands = {
    help: () => {
      return `Available commands:
  ls [path]          - list directory contents
  cd <path>          - change directory
  pwd                - print working directory
  cat <file>         - display file content
  mkdir <dir>        - create directory
  touch <file>       - create empty file
  rm <file>          - remove file
  rmdir <dir>        - remove empty directory
  echo <text>        - print text
  clear              - clear terminal
  whoami             - display current user
  hostname           - display system hostname
  date               - display current date
  uname              - display system information
  history            - show command history
  grep <pattern> <file> - search for pattern in file
  head <file>        - show first 10 lines of file
  tail <file>        - show last 10 lines of file
  wc <file>          - word, line, character count
  find <path> -name <pattern> - find files by name
  ps                 - show running processes (simulated)
  uptime             - show system uptime (simulated)
  tree [path]        - display directory tree structure
  chmod <mode> <file> - change file permissions (simulated)
  df                 - display filesystem disk space usage
  free               - display memory usage
  top                - display running processes
  ping <host>        - ping a host (simulated)
  wget <url>         - download a file (simulated)
  sudo <command>     - run command as superuser (simulated)
  man <command>      - display manual page for command`;
    },

    ls: (args) => {
      const path = args.length > 0 ? resolvePath(args[0]) : currentDirectory;
      const contents = getDirectoryContents(path);
      
      if (!contents) {
        return `ls: cannot access '${path}': No such file or directory`;
      }

      const items = Object.entries(contents).map(([name, item]) => {
        return item.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name;
      });

      return items.length > 0 ? items.join('  ') : '';
    },

    cd: (args) => {
      if (args.length === 0) {
        setCurrentDirectory('/home/user');
        return '';
      }

      let newPath = args[0];
      
      if (newPath === '..') {
        const segments = currentDirectory.split('/').filter(s => s);
        segments.pop();
        newPath = segments.length > 0 ? '/' + segments.join('/') : '/';
      } else if (newPath === '.') {
        return '';
      } else if (!newPath.startsWith('/')) {
        newPath = currentDirectory === '/' ? `/${newPath}` : `${currentDirectory}/${newPath}`;
      }

      if (isDirectory(newPath)) {
        setCurrentDirectory(newPath);
        return '';
      } else {
        return `cd: ${args[0]}: No such file or directory`;
      }
    },

    pwd: () => currentDirectory,

    cat: (args) => {
      if (args.length === 0) {
        return 'cat: missing file operand';
      }

      const path = resolvePath(args[0]);
      const content = getFileContent(path);
      
      if (content === null) {
        return `cat: ${args[0]}: No such file or directory`;
      }

      return content;
    },

    mkdir: (args) => {
      if (args.length === 0) {
        return 'mkdir: missing operand';
      }

      const path = resolvePath(args[0]);
      
      if (pathExists(path)) {
        return `mkdir: cannot create directory '${args[0]}': File exists`;
      }

      createDirectory(path);
      return '';
    },

    touch: (args) => {
      if (args.length === 0) {
        return 'touch: missing file operand';
      }

      const path = resolvePath(args[0]);
      
      if (pathExists(path)) {
        return ''; // File already exists, just update timestamp (simulated)
      }

      createFile(path);
      return '';
    },

    rm: (args) => {
      if (args.length === 0) {
        return 'rm: missing operand';
      }

      const path = resolvePath(args[0]);
      
      if (!pathExists(path)) {
        return `rm: cannot remove '${args[0]}': No such file or directory`;
      }

      if (isDirectory(path)) {
        return `rm: cannot remove '${args[0]}': Is a directory`;
      }

      removeItem(path);
      return '';
    },

    rmdir: (args) => {
      if (args.length === 0) {
        return 'rmdir: missing operand';
      }

      const path = resolvePath(args[0]);
      
      if (!pathExists(path)) {
        return `rmdir: failed to remove '${args[0]}': No such file or directory`;
      }

      if (!isDirectory(path)) {
        return `rmdir: failed to remove '${args[0]}': Not a directory`;
      }

      const contents = getDirectoryContents(path);
      if (Object.keys(contents).length > 0) {
        return `rmdir: failed to remove '${args[0]}': Directory not empty`;
      }

      removeItem(path);
      return '';
    },

    echo: (args) => args.join(' '),

    clear: () => {
      setHistory([]);
      return '';
    },

    whoami: () => username,

    hostname: () => hostname,

    date: () => new Date().toString(),

    uname: (args) => {
      if (args.includes('-a')) {
        return 'Linux linux-terminal 5.4.0-generic #47-Ubuntu SMP x86_64 GNU/Linux';
      }
      return 'Linux';
    },

    history: () => {
      return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
    },

    grep: (args) => {
      if (args.length < 2) {
        return 'grep: missing operand';
      }

      const pattern = args[0];
      const path = resolvePath(args[1]);
      const content = getFileContent(path);

      if (content === null) {
        return `grep: ${args[1]}: No such file or directory`;
      }

      const lines = content.split('\n');
      const matches = lines.filter(line => line.includes(pattern));
      return matches.join('\n');
    },

    head: (args) => {
      if (args.length === 0) {
        return 'head: missing file operand';
      }

      const path = resolvePath(args[0]);
      const content = getFileContent(path);

      if (content === null) {
        return `head: cannot open '${args[0]}' for reading: No such file or directory`;
      }

      const lines = content.split('\n');
      return lines.slice(0, 10).join('\n');
    },

    tail: (args) => {
      if (args.length === 0) {
        return 'tail: missing file operand';
      }

      const path = resolvePath(args[0]);
      const content = getFileContent(path);

      if (content === null) {
        return `tail: cannot open '${args[0]}' for reading: No such file or directory`;
      }

      const lines = content.split('\n');
      return lines.slice(-10).join('\n');
    },

    wc: (args) => {
      if (args.length === 0) {
        return 'wc: missing file operand';
      }

      const path = resolvePath(args[0]);
      const content = getFileContent(path);

      if (content === null) {
        return `wc: ${args[0]}: No such file or directory`;
      }

      const lines = content.split('\n').length;
      const words = content.split(/\s+/).filter(w => w).length;
      const chars = content.length;

      return `${lines} ${words} ${chars} ${args[0]}`;
    },

    find: (args) => {
      if (args.length < 3 || args[1] !== '-name') {
        return 'find: invalid usage. Use: find <path> -name <pattern>';
      }

      const searchPath = resolvePath(args[0]);
      const pattern = args[2];
      const results = [];

      const searchRecursive = (path, contents) => {
        Object.entries(contents).forEach(([name, item]) => {
          const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
          
          if (name.includes(pattern)) {
            results.push(fullPath);
          }
          
          if (item.type === 'directory') {
            searchRecursive(fullPath, item.contents);
          }
        });
      };

      const contents = getDirectoryContents(searchPath);
      if (contents) {
        searchRecursive(searchPath, contents);
      }

      return results.join('\n');
    },

    ps: () => {
      return `  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 5678 pts/0    00:00:00 terminal
 9012 pts/0    00:00:00 ps`;
    },

    uptime: () => {
      const uptime = Math.floor(Math.random() * 86400);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      return `up ${hours}:${minutes.toString().padStart(2, '0')}, 1 user, load average: 0.12, 0.08, 0.05`;
    },

    tree: (args) => {
      const path = args.length > 0 ? resolvePath(args[0]) : currentDirectory;
      const contents = getDirectoryContents(path);
      
      if (!contents) {
        return `tree: ${path}: No such file or directory`;
      }

      let output = path + '\n';
      const buildTree = (contents, prefix = '') => {
        const entries = Object.entries(contents);
        entries.forEach(([name, item], index) => {
          const isLast = index === entries.length - 1;
          const connector = isLast ? '└── ' : '├── ';
          const nextPrefix = prefix + (isLast ? '    ' : '│   ');
          
          output += prefix + connector + (item.type === 'directory' ? `\x1b[34m${name}/\x1b[0m` : name) + '\n';
          
          if (item.type === 'directory') {
            buildTree(item.contents, nextPrefix);
          }
        });
      };
      
      buildTree(contents);
      return output.slice(0, -1); // Remove trailing newline
    },

    chmod: (args) => {
      if (args.length < 2) {
        return 'chmod: missing operand';
      }
      return `chmod: changed permissions of '${args[1]}' to ${args[0]}`;
    },

    df: () => {
      return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1        8123456 4567890   3555566  57% /
tmpfs             512000       0    512000   0% /dev/shm
/dev/sda2        1048576  204800    843776  20% /home`;
    },

    free: () => {
      return `              total        used        free      shared  buff/cache   available
Mem:        8165432     3456789     2345678       12345     2362965     4234567
Swap:       2097152      567890     1529262`;
    },

    top: () => {
      return `top - 14:32:15 up 2:17, 1 user, load average: 0.08, 0.12, 0.05
Tasks: 127 total,   1 running, 126 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.5 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   7973.9 total,   2345.6 free,   3567.8 used,   2060.5 buff/cache
MiB Swap:   2048.0 total,   1492.4 free,    555.6 used.   4134.5 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 user      20   0  123456  45678  12345 S   5.2   2.3   1:23.45 terminal
 5678 root      20   0   67890  23456   7890 S   2.1   1.2   0:45.67 systemd`;
    },

    ping: (args) => {
      if (args.length === 0) {
        return 'ping: missing host operand';
      }
      
      const host = args[0];
      return `PING ${host} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${host} (127.0.0.1): icmp_seq=1 ttl=64 time=0.123 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=2 ttl=64 time=0.156 ms
64 bytes from ${host} (127.0.0.1): icmp_seq=3 ttl=64 time=0.098 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.098/0.125/0.156/0.024 ms`;
    },

    wget: (args) => {
      if (args.length === 0) {
        return 'wget: missing URL';
      }
      
      const url = args[0];
      const filename = url.split('/').pop() || 'index.html';
      
      createFile(resolvePath(filename), `Downloaded content from ${url}`);
      
      return `--2025-08-23 14:32:15--  ${url}
Resolving example.com (example.com)... 93.184.216.34
Connecting to example.com (example.com)|93.184.216.34|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1024 (1.0K) [text/html]
Saving to: '${filename}'

${filename}      100%[===================>]   1.00K  --.-KB/s    in 0s

2025-08-23 14:32:15 (12.5 MB/s) - '${filename}' saved [1024/1024]`;
    },

    sudo: (args) => {
      if (args.length === 0) {
        return 'sudo: a command must be specified';
      }
      
      const command = args[0];
      const restArgs = args.slice(1);
      
      if (commands[command]) {
        return `[sudo] password for ${username}: \n` + commands[command](restArgs);
      } else {
        return `sudo: ${command}: command not found`;
      }
    },

    man: (args) => {
      if (args.length === 0) {
        return 'man: missing operand';
      }
      
      const command = args[0];
      
      const manPages = {
        ls: `NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default).`,
        
        cd: `NAME
       cd - change directory

SYNOPSIS
       cd [DIRECTORY]

DESCRIPTION
       Change the current working directory to DIRECTORY.`,
        
        cat: `NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [OPTION]... [FILE]...

DESCRIPTION
       Concatenate FILE(s), or standard input, to standard output.`,
        
        help: `NAME
       help - display help information

SYNOPSIS
       help

DESCRIPTION
       Display available commands and their descriptions.`
      };
      
      return manPages[command] || `No manual entry for ${command}`;
    }
  };

  // Execute command
  const executeCommand = (input) => {
    const trimmedInput = input.trim();
    
    if (!trimmedInput) return '';

    const [command, ...args] = trimmedInput.split(' ').filter(arg => arg);
    
    if (commands[command]) {
      return commands[command](args);
    } else {
      return `${command}: command not found`;
    }
  };

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentCommand.trim()) return;

    const output = executeCommand(currentCommand);
    
    setHistory(prev => [
      ...prev,
      { type: 'command', content: `${username}@${hostname}:${currentDirectory}$ ${currentCommand}` },
      ...(output ? [{ type: 'output', content: output }] : [])
    ]);
    
    setCommandHistory(prev => [...prev, currentCommand]);
    setCurrentCommand('');
    setHistoryIndex(-1);
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : -1;
        setHistoryIndex(newIndex);
        setCurrentCommand(newIndex === -1 ? '' : commandHistory[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion for commands and files
      const words = currentCommand.split(' ');
      const currentWord = words[words.length - 1];
      
      if (words.length === 1) {
        // Complete command
        const matchingCommands = Object.keys(commands).filter(cmd => cmd.startsWith(currentWord));
        if (matchingCommands.length === 1) {
          setCurrentCommand(matchingCommands[0] + ' ');
        }
      } else {
        // Complete file/directory names
        const contents = getDirectoryContents(currentDirectory);
        if (contents) {
          const matchingItems = Object.keys(contents).filter(item => item.startsWith(currentWord));
          if (matchingItems.length === 1) {
            words[words.length - 1] = matchingItems[0];
            setCurrentCommand(words.join(' ') + ' ');
          }
        }
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      setCurrentCommand('');
      setHistory(prev => [
        ...prev,
        { type: 'command', content: `${username}@${hostname}:${currentDirectory}$ ${currentCommand}^C` }
      ]);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when terminal is clicked
  useEffect(() => {
    if (inputRef.current && isActive) {
      inputRef.current.focus();
    }
  }, [isActive, history]);

  // Initialize dragging system (disabled on mobile)
  useEffect(() => {
    if (isMobile) return;

    const windowElement = windowRef.current;
    if (!windowElement) return;

    let highestZ = 1000;
    let animationFrame = null;

    const handleMouseMove = (e) => {
      if (dragState.current.holdingWindow && !isMaximized) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        const deltaX = e.clientX - dragState.current.mouseTouchX;
        const deltaY = e.clientY - dragState.current.mouseTouchY;
        
        dragState.current.currentWindowX = dragState.current.startWindowX + deltaX;
        dragState.current.currentWindowY = dragState.current.startWindowY + deltaY;

        const minX = -windowElement.offsetWidth + 100;
        const minY = 0;
        const maxX = window.innerWidth - 100;
        const maxY = window.innerHeight - 100;

        dragState.current.currentWindowX = Math.max(minX, Math.min(maxX, dragState.current.currentWindowX));
        dragState.current.currentWindowY = Math.max(minY, Math.min(maxY, dragState.current.currentWindowY));

        animationFrame = requestAnimationFrame(() => {
          windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
        });
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        const titleBar = e.target.closest('.title-bar');
        const isButton = e.target.closest('.traffic-lights') || e.target.closest('button');
        
        if (titleBar && !isButton) {
          e.preventDefault();
          e.stopPropagation();
          
          dragState.current.holdingWindow = true;
          setIsActive(true);
          setIsDragging(true);

          windowElement.style.zIndex = highestZ;
          highestZ += 1;

          dragState.current.mouseTouchX = e.clientX;
          dragState.current.mouseTouchY = e.clientY;
          dragState.current.startWindowX = dragState.current.currentWindowX;
          dragState.current.startWindowY = dragState.current.currentWindowY;

          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'default';
          document.body.style.pointerEvents = 'none';
          windowElement.style.pointerEvents = 'auto';
        }
      }
    };

    const handleMouseUp = () => {
      if (dragState.current.holdingWindow) {
        dragState.current.holdingWindow = false;
        setIsDragging(false);
        
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.body.style.pointerEvents = '';
        windowElement.style.pointerEvents = '';

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      }
    };

    const handleContextMenu = (e) => {
      if (dragState.current.holdingWindow) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    windowElement.addEventListener('mousedown', handleMouseDown);

    windowElement.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
    windowElement.style.willChange = 'transform';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      windowElement.removeEventListener('mousedown', handleMouseDown);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.body.style.pointerEvents = '';
      
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isMaximized, isMobile]);

  // Traffic light handlers
  const handleClose = () => {
    onClose();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      dragState.current.currentWindowX = prevPosition.x;
      dragState.current.currentWindowY = prevPosition.y;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(${dragState.current.currentWindowX}px, ${dragState.current.currentWindowY}px, 0)`;
      }
    } else {
      setPrevPosition({
        x: dragState.current.currentWindowX,
        y: dragState.current.currentWindowY
      });
      setIsMaximized(true);
      dragState.current.currentWindowX = 0;
      dragState.current.currentWindowY = isMobile ? 0 : 25;
      if (windowRef.current) {
        windowRef.current.style.transform = `translate3d(0px, ${isMobile ? 0 : 25}px, 0)`;
      }
    }
  };

  const handleWindowClick = () => {
    setIsActive(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Get responsive dimensions
  const getWindowDimensions = () => {
    if (isMaximized) {
      return {
        width: '100vw',
        height: isMobile ? '100vh' : 'calc(100vh - 25px)'
      };
    }
    
    if (isMobile) {
      return {
        width: '100vw',
        height: '100vh'
      };
    }
    
    // Desktop windowed mode
    const maxWidth = Math.min(1000, window.innerWidth - 100);
    const maxHeight = Math.min(600, window.innerHeight - 100);
    
    return {
      width: `${maxWidth}px`,
      height: `${maxHeight}px`
    };
  };

  const dimensions = getWindowDimensions();

  return (
    <div
      ref={windowRef}
      className={`fixed bg-gray-900 overflow-hidden ${
        isMobile ? 'rounded-none' : 'rounded-xl shadow-2xl'
      } ${
        isActive ? 'ring-2 ring-blue-500/20' : ''
      }`}
      style={{
        left: 0,
        top: 0,
        width: dimensions.width,
        height: dimensions.height,
        zIndex: isActive ? 1000 : 999,
        display: isMinimized ? 'none' : 'block',
        willChange: isDragging ? 'transform' : 'auto'
      }}
      onClick={handleWindowClick}
    >
      {/* Title Bar */}
      <div
        className={`title-bar ${isMobile ? 'h-14' : 'h-12'} bg-gray-800 border-b border-gray-700 flex items-center justify-between ${isMobile ? 'px-4' : 'px-4'} select-none ${
          isActive ? 'bg-gray-800' : 'bg-gray-850'
        }`}
        style={{ 
          cursor: isMobile ? 'default' : 'default',
          WebkitAppRegion: isMobile ? 'no-drag' : 'drag'
        }}
      >
        {/* Traffic Light Buttons */}
        <div className="traffic-lights flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'} bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150 group flex items-center justify-center`}
            onClick={handleClose}
            title="Close"
            style={{ cursor: 'pointer' }}
          >
            <X size={isMobile ? 10 : 8} className="text-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          {!isMobile && (
            <>
              <button
                className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMinimize}
                title="Minimize"
                style={{ cursor: 'pointer' }}
              >
                <Minus size={8} className="text-yellow-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button
                className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150 group flex items-center justify-center"
                onClick={handleMaximize}
                title={isMaximized ? "Restore" : "Maximize"}
                style={{ cursor: 'pointer' }}
              >
                <Square size={6} className="text-green-800 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </>
          )}
        </div>

        {/* Window Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <h1 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-gray-300 flex items-center gap-2`}>
            <Terminal size={isMobile ? 18 : 16} />
            <span className={isMobile ? 'block' : 'hidden sm:block'}>
              Terminal - {username}@{hostname}:{currentDirectory.length > 20 ? '...' + currentDirectory.slice(-17) : currentDirectory}
            </span>
            <span className={isMobile ? 'hidden' : 'block sm:hidden'}>Terminal</span>
          </h1>
        </div>

        {/* Toolbar Icons */}
        {!isMobile && (
          <div className="flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
              <Folder size={16} className="text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
              <Search size={16} className="text-gray-400" />
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" style={{ cursor: 'pointer' }}>
              <Settings size={16} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className={`h-full bg-black text-green-400 font-mono ${isMobile ? 'text-sm p-3' : 'text-sm p-4'} overflow-y-auto`}
        style={{ 
          height: isMobile ? 'calc(100% - 3.5rem)' : 'calc(100% - 3rem)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4a5568 #1a202c'
        }}
      >
        {/* History */}
        {history.map((entry, index) => (
          <div key={index} className="mb-1">
            {entry.type === 'command' ? (
              <div className="text-green-400 break-all">{entry.content}</div>
            ) : (
              <pre className="text-gray-300 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{
                __html: entry.content
                  .replace(/\x1b\[34m(.*?)\x1b\[0m/g, '<span class="text-blue-400">$1</span>')
                  .replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span class="text-red-400">$1</span>')
                  .replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span class="text-yellow-400">$1</span>')
              }} />
            )}
          </div>
        ))}

        {/* Current Command Line */}
        <form onSubmit={handleSubmit} className="flex items-start flex-wrap">
          <span className="text-green-400 mr-2 shrink-0 break-all">
            {isMobile ? 
              `${username}@${hostname}:${currentDirectory.length > 15 ? '...' + currentDirectory.slice(-12) : currentDirectory}$ ` :
              `${username}@${hostname}:${currentDirectory}$ `
            }
          </span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent text-green-400 border-none outline-none font-mono"
            style={{ cursor: 'text' }}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}