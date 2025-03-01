import { useEffect, useRef, useState } from "react";
import { Paperclip, UploadSimple, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUploadMediaMutation } from "@/redux/api/chatApi.js";
import { Loader2 } from "lucide-react";
import { socket } from "@/socket.js";
import { fetchMessages } from "@/redux/slices/conversationSlice.js";
import { useDispatch, useSelector } from "react-redux";

const Attachments = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const dispatch = useDispatch();
  const chat = useSelector((state) => state?.conversation?.currentConversation);
  const user = useSelector((state) => state?.auth?.user);
  const users =
    chat?.participants?.filter((person) => person?._id !== user?._id) || [];

  const [uploadMedia, { data, isLoading, error }] = useUploadMediaMutation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    e.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    setSelectedFile(file);
  };

  const handleSend = async () => {
    if (!selectedFile) return alert("No file selected!");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadMedia(formData);
      setUploadSuccess(true);
    } catch (err) {
      console.error("File upload failed:", err);
      alert("File upload failed. Please try again.");
      setUploadSuccess(false);
    }

    setSelectedFile(null);
  };

  useEffect(() => {
    if (uploadSuccess && data?.file) {
      socket.emit("message", { conversation_id: chat?._id });

      socket.emit("file_message", {
        conversation_id: chat?._id,
        file: JSON.stringify(data.file),
        receiver_id: users[0]?._id,
      });

      setUploadSuccess(false);
    }
  }, [uploadSuccess, data?.file, chat?._id, users]);

  useEffect(() => {
    const handleDatabaseChange = () => {
      socket.emit("get_messages", { conversation_id: chat?._id });
    };

    const handleDispatchMessages = (data) => {
      dispatch(fetchMessages(data));
    };

    handleDatabaseChange();
    socket.on("database-changed", handleDatabaseChange);
    socket.on("dispatch_messages", handleDispatchMessages);

    return () => {
      socket.off("database-changed", handleDatabaseChange);
      socket.off("dispatch_messages", handleDispatchMessages);
    };
  }, [chat?._id, dispatch]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSelectedFile(null);
      }}
    >
      <DialogTrigger asChild>
        <button onClick={() => setIsOpen(true)}>
          <Paperclip size={24} color="gray" weight="bold" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div
          className="border border-gray-300 dark:border-gray-700 rounded-md p-6 cursor-pointer text-center"
          onClick={() => fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="shadow-2xl flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-black text-black dark:text-white mb-2">
              <UploadSimple size={24} />
            </div>
            <span className="font-medium text-black dark:text-white">
              Drag & Drop a file here or Click to Upload
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*, video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Selected File:</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📁 {selectedFile.name}
            </p>
          </div>
        )}

        <DialogFooter>
          {isLoading ? (
            <Button className="py-6 text-base font-semibold" disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              className="bg-blue-600 text-white hover:bg-opacity-80 flex items-center space-x-2"
              onClick={handleSend}
              disabled={!selectedFile}
            >
              <PaperPlaneTilt size={20} weight="bold" />
              <span>Send</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Attachments;
