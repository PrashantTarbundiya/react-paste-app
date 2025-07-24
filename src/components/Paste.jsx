import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromPaste } from "../redux/pasteSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Paste = () => {
  const pastes = useSelector((state) => state.paste.pastes);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Enhanced filtering and sorting
  const filteredAndSortedPastes = useMemo(() => {
    let filtered = pastes.filter((paste) => {
      if (!paste || !paste.title) return false;
      
      const titleMatch = paste.title.toLowerCase().includes(searchTerm.toLowerCase());
      const contentMatch = paste.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return titleMatch || contentMatch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updated':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [pastes, searchTerm, sortBy]);

  function handleDelete(pasteId) {
    if (showDeleteConfirm === pasteId) {
      dispatch(removeFromPaste(pasteId));
      setShowDeleteConfirm(null);
      toast.success("Paste deleted successfully");
    } else {
      setShowDeleteConfirm(pasteId);
      setTimeout(() => setShowDeleteConfirm(null), 5000); // Auto-cancel after 5 seconds
    }
  }

  function formatDateTime(dateTime) {
    if (!dateTime) return "Unknown date";
    
    try {
      const date = new Date(dateTime);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Today";
      if (diffDays === 2) return "Yesterday";
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  }

  async function handleCopy(content, title) {
    if (!content) {
      toast.error("No content to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast.success(`"${title}" copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy content");
      console.error("Copy error:", err);
    }
  }

  async function handleShare(paste) {
    if (!paste || !paste._id) {
      toast.error("Invalid paste data");
      return;
    }

    const shareData = {
      title: paste.title || "Untitled Paste",
      text: paste.content || "",
      url: `${window.location.origin}/pastes/${paste._id}`,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error("Failed to share");
        console.error("Share error:", err);
      }
    }
  }

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">My Pastes</h2>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              className="w-full px-4 py-3 pl-10 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              type="search"
              placeholder="Search pastes by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5 text-slate-400">
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
        
        {/* Stats */}
        <div className="mt-4 text-slate-400 text-sm">
          {filteredAndSortedPastes.length} of {pastes.length} pastes
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Pastes List */}
      {filteredAndSortedPastes.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 text-center">
          {pastes.length === 0 ? (
            <div>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No pastes yet</h3>
              <p className="text-slate-400 mb-4">Create your first paste to get started</p>
              <Link to="/">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Create Paste
                </button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No matching pastes</h3>
              <p className="text-slate-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedPastes.map((paste) => (
            <div
              key={paste._id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 fade-in"
            >
              {/* Paste Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-1 text-truncate">
                    {paste.title || "Untitled Paste"}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span>📅 {formatDateTime(paste.createdAt)}</span>
                    {paste.updatedAt && paste.updatedAt !== paste.createdAt && (
                      <span>✏️ Updated {formatDateTime(paste.updatedAt)}</span>
                    )}
                    <span>📝 {paste.content?.length || 0} chars</span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-slate-300 text-sm font-mono text-wrap overflow-hidden">
                  {truncateContent(paste.content)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Link to={`/pastes/${paste._id}`}>
                  <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    👁️ View
                  </button>
                </Link>
                
                <Link to={`/?pasteId=${paste._id}`}>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                    ✏️ Edit
                  </button>
                </Link>
                
                <button
                  onClick={() => handleCopy(paste.content, paste.title)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  disabled={!paste.content}
                >
                  📋 Copy
                </button>
                
                <button
                  onClick={() => handleShare(paste)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  🔗 Share
                </button>
                
                <button
                  onClick={() => handleDelete(paste._id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    showDeleteConfirm === paste._id
                      ? 'bg-red-700 text-white animate-pulse'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {showDeleteConfirm === paste._id ? '⚠️ Confirm Delete' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Paste;
