import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const ViewPaste = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const allPaste = useSelector((state) => state.paste.pastes);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const paste = allPaste.find((p) => p._id === id);

  // Handle invalid paste ID
  useEffect(() => {
    if (!id) {
      toast.remove(); // Remove any existing toasts
      toast.error("Invalid paste ID");
      navigate('/pastes');
    }
  }, [id, navigate]);

  const handleCopy = async () => {
    toast.remove(); // Remove any existing toasts
    
    if (!paste?.content) {
      toast.error("No content to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(paste.content);
      toast.success("Content copied to clipboard!");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error("Failed to copy content");
      console.error("Copy error:", err);
    }
  };

  const handleShare = async () => {
    toast.remove(); // Remove any existing toasts
    
    if (!paste) return;

    const shareData = {
      title: paste.title || "Untitled Paste",
      text: paste.content || "",
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error("Failed to share");
        console.error("Share error:", err);
      }
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Unknown date";
    
    try {
      return new Date(dateTime).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  const downloadPaste = () => {
    toast.remove(); // Remove any existing toasts
    
    if (!paste?.content) {
      toast.error("No content to download");
      return;
    }

    try {
      const element = document.createElement("a");
      const file = new Blob([paste.content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${paste.title || 'paste'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href); // Clean up the URL object
      toast.success(`"${paste.title}" downloaded successfully`);
    } catch (error) {
      toast.error("Failed to download paste");
      console.error("Download error:", error);
    }
  };

  if (!paste) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 shadow-xl text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-white mb-2">Paste Not Found</h2>
        <p className="text-slate-400 mb-6">
          The paste you're looking for doesn't exist or may have been deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/pastes">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View All Pastes
            </button>
          </Link>
          <Link to="/">
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              Create New Paste
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-6 overflow-auto' : ''}`}>
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
              {paste.title || "Untitled Paste"}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span>📅</span>
                <span className="hidden sm:inline">Created:</span>
                <span>{formatDateTime(paste.createdAt)}</span>
              </span>
              {paste.updatedAt && paste.updatedAt !== paste.createdAt && (
                <span className="flex items-center gap-1">
                  <span>✏️</span>
                  <span className="hidden sm:inline">Updated:</span>
                  <span>{formatDateTime(paste.updatedAt)}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <span>📝</span>
                <span>{paste.content?.length || 0} chars</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🔢</span>
                <span>{paste.content?.split('\n').length || 0} lines</span>
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="self-end sm:self-start p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm sm:text-base"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <span className="text-sm sm:text-base">{isFullscreen ? "🗗" : "🗖"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handleCopy}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
              copySuccess
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={!paste.content}
          >
            {copySuccess ? (
              <>
                <span>✅</span>
                <span className="hidden sm:inline">Copied!</span>
                <span className="sm:hidden">Done</span>
              </>
            ) : (
              <>
                <span>📋</span>
                <span className="hidden sm:inline">Copy Content</span>
                <span className="sm:hidden">Copy</span>
              </>
            )}
          </button>
          
          <Link to={`/?pasteId=${paste._id}`} className="w-full lg:w-auto">
            <button className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span>✏️</span>
              <span>Edit</span>
            </button>
          </Link>
          
          <button
            onClick={handleShare}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <span>🔗</span>
            <span>Share</span>
          </button>
          
          <button
            onClick={downloadPaste}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
            disabled={!paste.content}
          >
            <span>💾</span>
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">Down</span>
          </button>
          
          <Link to="/pastes" className="w-full lg:w-auto col-span-2 sm:col-span-1">
            <button className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base">
              <span>📂</span>
              <span className="hidden sm:inline">Back to Pastes</span>
              <span className="sm:hidden">Back</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Content Display */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-slate-700/50 px-6 py-3 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Content</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Read-only view</span>
            </div>
          </div>
        </div>
        
        <div className="p-0">
          <textarea
            className="w-full bg-slate-900/50 text-slate-200 font-mono text-sm leading-relaxed resize-none border-none outline-none p-6"
            style={{
              minHeight: isFullscreen ? 'calc(100vh - 300px)' : '400px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace'
            }}
            value={paste.content || "No content available"}
            readOnly
            placeholder="No content available"
          />
        </div>
        
        {/* Footer with stats */}
        <div className="bg-slate-700/30 px-6 py-3 border-t border-slate-600 text-xs text-slate-400">
          <div className="flex justify-between items-center">
            <span>
              Words: {paste.content ? paste.content.trim().split(/\s+/).filter(Boolean).length : 0}
            </span>
            <span>
              Size: {paste.content ? new Blob([paste.content]).size : 0} bytes
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions (only in fullscreen) */}
      {isFullscreen && (
        <div className="fixed bottom-6 right-6 flex gap-2">
          <button
            onClick={handleCopy}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            title="Copy content"
          >
            📋
          </button>
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-3 bg-slate-600 hover:bg-slate-700 text-white rounded-full shadow-lg transition-colors"
            title="Exit fullscreen"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewPaste;
