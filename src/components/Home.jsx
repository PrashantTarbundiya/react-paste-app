import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToPaste, updateToPaste } from "../redux/pasteSlice";
import toast from "react-hot-toast";

const Home = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const pasteId = searchParams.get("pasteId");
  const dispatch = useDispatch();

  const allPaste = useSelector((state) => state.paste.pastes);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }
    
    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.trim().length < 1) {
      newErrors.content = "Content cannot be empty";
    } else if (content.length > 50000) {
      newErrors.content = "Content must be less than 50,000 characters";
    }

    // Check for duplicate titles (except when updating)
    if (!pasteId && title.trim()) {
      const duplicateTitle = allPaste.find(
        paste => paste.title.toLowerCase() === title.trim().toLowerCase()
      );
      if (duplicateTitle) {
        newErrors.title = "A paste with this title already exists";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPaste = async () => {
    toast.remove(); // Remove any existing toasts
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);
    
    try {
      const paste = {
        title: title.trim(),
        content: content.trim(),
        _id: pasteId || Date.now().toString(36) + Math.random().toString(36).substr(2),
        createdAt: pasteId ? allPaste.find(p => p._id === pasteId)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (pasteId) {
        dispatch(updateToPaste(paste));
      } else {
        dispatch(addToPaste(paste));
      }

      // Clear form and navigate
      setTitle("");
      setContent("");
      setSearchParams({});
      setErrors({});
      
      // Navigate to pastes page after successful creation/update
      setTimeout(() => {
        navigate('/pastes');
      }, 1000);
      
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error creating/updating paste:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Clear title errors when user starts typing
    if (errors.title && newTitle.trim()) {
      setErrors(prev => ({ ...prev, title: "" }));
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Clear content errors when user starts typing
    if (errors.content && newContent.trim()) {
      setErrors(prev => ({ ...prev, content: "" }));
    }
  };

  const clearForm = () => {
    toast.remove(); // Remove any existing toasts
    setTitle("");
    setContent("");
    setErrors({});
    setSearchParams({});
    toast.success("Form cleared");
  };

  useEffect(() => {
    if (pasteId) {
      const paste = allPaste.find((p) => p._id === pasteId);
      if (paste) {
        setTitle(paste.title);
        setContent(paste.content);
        setErrors({});
      } else {
        toast.remove(); // Remove any existing toasts
        toast.error("Paste not found");
        setSearchParams({});
      }
    }
  }, [pasteId, allPaste, setSearchParams]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 shadow-xl">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {pasteId ? "Edit Paste" : "Create New Paste"}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          {pasteId ? "Make changes to your existing paste" : "Share your code, text, or notes"}
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Title *
          </label>
          <div className="relative">
            <input
              id="title"
              type="text"
              className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                errors.title ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={handleTitleChange}
              maxLength={100}
              disabled={isLoading}
            />
            <div className="absolute right-3 top-2.5 sm:top-3.5 text-xs text-slate-500">
              {title.length}/100
            </div>
          </div>
          {errors.title && (
            <p className="mt-1 text-xs sm:text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.title}
            </p>
          )}
        </div>

        {/* Content Textarea */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
            Content *
          </label>
          <div className="relative">
            <textarea
              id="content"
              className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y min-h-[250px] sm:min-h-[300px] text-sm sm:text-base ${
                errors.content ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Paste your content here..."
              value={content}
              onChange={handleContentChange}
              maxLength={50000}
              disabled={isLoading}
              style={{ fontFamily: 'Monaco, Consolas, "Courier New", monospace' }}
            />
            <div className="absolute right-3 bottom-3 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
              {content.length.toLocaleString()}/50,000
            </div>
          </div>
          {errors.content && (
            <p className="mt-1 text-xs sm:text-sm text-red-400 flex items-center">
              <span className="mr-1">⚠</span>
              {errors.content}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
          <button
            onClick={createPaste}
            disabled={isLoading || (!title.trim() && !content.trim())}
            className={`flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
              isLoading || (!title.trim() && !content.trim())
                ? 'bg-slate-600 cursor-not-allowed text-slate-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="hidden sm:inline">{pasteId ? "Updating..." : "Creating..."}</span>
                <span className="sm:hidden">{pasteId ? "Updating" : "Creating"}</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">{pasteId ? "📝" : "✨"}</span>
                <span className="hidden sm:inline">{pasteId ? "Update Paste" : "Create Paste"}</span>
                <span className="sm:hidden">{pasteId ? "Update" : "Create"}</span>
              </>
            )}
          </button>
          
          <button
            onClick={clearForm}
            disabled={isLoading}
            className="px-4 py-2.5 sm:px-6 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <span>🗑️</span>
            <span className="hidden sm:inline">Clear Form</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
