import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeFromPaste } from "../redux/pasteSlice";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Paste = () => {
  const pastes = useSelector((state) => state.paste.pastes);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  const filterData = pastes.filter((paste) =>
    paste.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleDelete(pasteId) {
    dispatch(removeFromPaste(pasteId));
  }

  function formatDateTime(dateTime) {
    return new Date(dateTime).toLocaleString();
  }

  async function handleShare(paste) {
    const shareData = {
      title: paste.title,
      text: paste.content,
      url: `${window.location.origin}/pastes/${paste._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard (Share not supported)");
      }
    } catch (err) {
      toast.error("Failed to share");
    }
  }

  return (
    <div>
      <input
        className="p-2 rounded-2xl min-w-[600px]"
        type="search"
        placeholder="Search here"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filterData.length > 0 &&
        filterData.map((paste) => (
          <div className="border rounded-md text-center p-4 my-4" key={paste?._id}>
            <div className="text-xl font-bold">{paste.title}</div>
            <div className="text-gray-700 whitespace-pre-wrap">{paste.content}</div>
            <div className="flex flex-wrap justify-center gap-4 mt-3">
              <Link to={`/?pasteId=${paste._id}`}>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-lg">Edit</button>
              </Link>
              <Link to={`/pastes/${paste._id}`}>
                <button className="px-3 py-1 bg-green-500 text-white rounded-lg">View</button>
              </Link>
              <button
                onClick={() => handleDelete(paste._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paste?.content);
                  toast.success("Copied to Clipboard");
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
              >
                Copy
              </button>
              <button
                onClick={() => handleShare(paste)}
                className="px-3 py-1 bg-purple-500 text-white rounded-lg"
              >
                Share
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {formatDateTime(paste.createdAt)}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Paste;
