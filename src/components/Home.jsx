import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToPaste, updateToPaste } from "../redux/pasteSlice";

const Home = () => {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pasteId = searchParams.get("pasteId");
  const dispatch = useDispatch();

  const allPaste = useSelector((state) => state.paste.pastes);
  const createPaste = () => {
    const paste = {
      title,
      content: value,
      _id: pasteId || Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    if (pasteId) {
      dispatch(updateToPaste(paste));
    } else {
      dispatch(addToPaste(paste));
    }

    setTitle("");
    setValue("");
    setSearchParams({});
  };

  useEffect(() => {
  if (pasteId) {
    const paste = allPaste.find((p) => p._id === pasteId);
    if (paste) {
      setTitle(paste.title);
      setValue(paste.content);
    }
  }
}, [pasteId, allPaste]);

  return (
    <div className="p-4">
      <div className="flex gap-4">
        <input
          className="p-2 rounded-lg border min-w-[78%]"
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={createPaste}
          className="bg-blue-500 text-white p-2 rounded-lg"
        >
          {pasteId ? "Update Paste" : "Create Paste"}
        </button>
      </div>
      <textarea
        className="mt-4 w-full p-2 border rounded-lg"
        rows={15}
        placeholder="Enter content"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      ></textarea>
    </div>
  );
};

export default Home;
