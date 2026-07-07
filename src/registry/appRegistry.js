import NotePad from "../apps/NotePad/NotePadApp";
import Calculator from "../apps/Calculator/CalculatorApp";
import Calendar from "../apps/Calendar/CalendarApp";
import Terminal from "../apps/Terminal/TerminalApp";
import FileManager from "../apps/Finder/FinderApp";
import VSCode from "../apps/VSCode/VSCodeApp";
import Edge from "../apps/Edge/EdgeApp";
import Maps from "../apps/Maps/MapsApp";
import Photos from "../apps/Photos/PhotosApp";
import MusicPlayer from "../apps/Music/MusicApp";
import VideoPlayer from "../apps/VideoPlayer/VideoPlayerApp";
import VLCPlayer from "../apps/VlcPlayer/VlcPlayerApp";
import Trash from "../apps/Trash/TrashApp";
import AppStore from "../apps/AppStore/AppStoreApp";
import Whatspp from "../apps/WhatsApp/WhatsAppApp";
import Perplexity from "../apps/Perplexity/PerplexityApp";
import SettingsApp from "../apps/Settings/SettingsApp";

export const allAvailableApps = [
  { id: "filemanager", name: "Finder", icon: "/AppIcons/finder.png", component: FileManager },
  { id: "launchpad", name: "Launchpad", icon: "/AppIcons/launchpad.png", component: null },
  { id: "preferences", name: "Preferences", icon: "/AppIcons/preferences.png", component: SettingsApp },
  { id: "contacts", name: "Contacts", icon: "/AppIcons/contacts.png", component: null },
  { id: "notepad", name: "Notes", icon: "/AppIcons/notes.png", component: NotePad },
  { id: "appstore", name: "App Store", icon: "/AppIcons/appstore.png", component: AppStore },
  { id: "calculator", name: "Calculator", icon: "/AppIcons/calculator.png", component: Calculator },
  { id: "calendar", name: "Calendar", icon: "/AppIcons/calendar.png", component: Calendar },
  { id: "terminal", name: "Terminal", icon: "/AppIcons/terminal.png", component: Terminal },
  { id: "vscode", name: "VS Code", icon: "/AppIcons/vscode.svg", component: VSCode },
  { id: "photos", name: "Photos", icon: "/AppIcons/photos.png", component: Photos },
  { id: "messages", name: "Messages", icon: "/AppIcons/message.png", component: null },
  { id: "maps", name: "Maps", icon: "/AppIcons/maps.png", component: Maps },
  { id: "mail", name: "Mail", icon: "/AppIcons/mail.png", component: null },
  { id: "trash", name: "Trash", icon: "/AppIcons/bin.png", component: Trash },
  { id: "musicplayer", name: "Music", icon: "/AppIcons/music.png", component: MusicPlayer },
  { id: "reminders", name: "Reminders", icon: "/AppIcons/reminders.png", component: null },
  { id: "edge", name: "Edge", icon: "/AppIcons/edge.png", component: Edge },
  { id: "vlcplayer", name: "VLC", icon: "/AppIcons/vlc.png", component: VLCPlayer },
  { id: "photoshop", name: "Photoshop", icon: "/AppIcons/photos.png", component: null },
  { id: "illustrator", name: "Illustrator", icon: "/AppIcons/photos.png", component: null },
  { id: "premiere", name: "Premiere", icon: "/AppIcons/vlc.png", component: null },
  { id: "aftereffects", name: "After Effects", icon: "/AppIcons/calculator.png", component: null },
  { id: "figma", name: "Figma", icon: "/AppIcons/figma.webp", component: null },
  { id: "sketch", name: "Sketch", icon: "/AppIcons/photos.png", component: null },
  { id: "spotify", name: "Spotify", icon: "/AppIcons/music.png", component: null },
  { id: "discord", name: "Discord", icon: "/AppIcons/message.png", component: null },
  { id: "slack", name: "Slack", icon: "/AppIcons/message.png", component: null },
  { id: "zoom", name: "Zoom", icon: "/AppIcons/zoom.webp", component: null },
  { id: "teams", name: "Teams", icon: "/AppIcons/teams.jpg", component: null },
  { id: "chrome", name: "Chrome", icon: "/AppIcons/edge.png", component: null },
  { id: "chess", name: "Chess", icon: "/AppIcons/chess.png", component: null },
  { id: "videoplayer", name: "Video Player", icon: "/AppIcons/TV.jpg", component: VideoPlayer },
  { id: "whatsapp", name: "WhatsApp", icon: "/AppIcons/Whatsapp.png", component: Whatspp },
  { id: "instagram", name: "Instagram", icon: "/AppIcons/Instagram.jpg", component: null },
  { id: "perplexity", name: "Perplexity.AI", icon: "/AppIcons/perplexity.avif", component: Perplexity },
];

export const defaultAppIds = ["launchpad", "appstore", "filemanager", "terminal", "videoplayer", "trash", "preferences"];

export const defaultAppObjects = allAvailableApps.filter(app =>
  defaultAppIds.includes(app.id)
);
