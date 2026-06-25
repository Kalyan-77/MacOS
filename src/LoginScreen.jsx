import { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginScreen({ onUnlock, userName, avatarUrl }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = () => {
    // Temporary password
    const correctPassword = "123456";

    if (password === correctPassword) {
      setError("");
      onUnlock();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb')",
      }}
    >
      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mb-6">
          <img
            src={avatarUrl || "https://i.pravatar.cc/300"}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Username */}
        <h1 className="text-3xl font-semibold mb-8">
          {userName || "Hari Kalyan"}
        </h1>

        {/* Password Box */}
        <div className="flex items-center bg-white/15 backdrop-blur-md rounded-xl px-4 py-3 w-80 border border-white/20">
          <Lock size={18} />

          <input
            type="password"
            placeholder="Enter Password"
            className="flex-1 bg-transparent outline-none px-3 text-white placeholder:text-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUnlock();
              }
            }}
          />

          <button
            onClick={handleUnlock}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-300 font-medium">
            {error}
          </p>
        )}

        <p className="mt-8 text-sm text-gray-200">
          Press Enter to Unlock
        </p>
      </div>
    </div>
  );
}