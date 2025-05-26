import { useSelector } from "react-redux";
import { useParams } from "react-router-dom"; 
import toast from "react-hot-toast";

const ViewPaste = () => {
  const { id } = useParams();
  const allPaste = useSelector((state) => state.paste.pastes);

  const paste = allPaste.find((p) => p._id === id);

  if (!paste) {
    return <div className="p-4">Paste not found.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex gap-4 ">
        <input
          className="p-2 rounded-lg border min-w-[84%]"
          type="text"
          placeholder="Enter title"
          value={paste.title}
          disabled
        />
        <button
        className="small"
        onClick={() => {
          navigator.clipboard.writeText(paste.content);
          toast.success("Copy to Clipboard");
        }}
      >
        Copy
      </button>
      </div>
      
      <textarea
        className="mt-4 w-full p-2 border rounded-lg"
        rows={10}
        placeholder="Enter content"
        value={paste.content}
        disabled
      ></textarea>

    </div>
  );
};

export default ViewPaste;
