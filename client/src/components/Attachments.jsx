import { Paperclip, PaperPlaneTilt } from "@phosphor-icons/react";
import Dropzone from "dropzone";
import { UploadSimple } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { useEffect, useRef } from "react";

const Attachments = ({
  acceptedFiles = "*",
  maxFileSize = 100 * 1024 * 1024,
  url = "/file/post",
}) => {
  const dropzoneRef = useRef(null);
  const formRef = useRef(null);
  useEffect(() => {
    Dropzone.autoDiscover = false;

    if (!dropzoneRef.current && formRef.current) {
      dropzoneRef.current = new Dropzone(formRef.current, {
        url,
        acceptedFiles,
        maxFileSize: maxFileSize,
      });
    }

    return () => {
      if (dropzoneRef.current) {
        dropzoneRef.current.destroy();
        dropzoneRef.current = null;
      }
    };
  }, []);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>
          <Paperclip size={24} color="gray" weight="bold" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="rounded-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer">
          <div className="p-6">
            <form
              action={url}
              ref={formRef}
              id="upload"
              className="dropzone rounded-md !border-dashed !border-gray-300 bg-white hover:!border-gray-500 dark:!border-gray-700 dark:bg-gray-800 dark:hover:!border-gray-600"
            >
              <div className="dz-message">
                <div className="mb-2.5 flex flex-col items-center justify-center">
                  <div className="shadow-2xl flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-black text-black dark:text-white mb-2">
                    <UploadSimple size={24} />
                  </div>
                  <span className="font-medium text-black dark:text-white">
                    Drop files here to upload
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center space-x-2 justify-between mt-4">
          <input
            type="text"
            className="border rounded-md  border-gray-300 dark:border-gray-700 hover:border-blue-950 w-full outline-none p-2 bg-transparent focus:border-blue-950 dark:text-white dark:hover:border-blue-300 dark:focus:border-blue-300"
            placeholder="Type your message"
          />
          <button className="flex items-center justify-center h-10 max-w-10 w-full rounded-md bg-blue-600 text-white hover:bg-opacity-80">
            <PaperPlaneTilt size={20} color="white" weight="bold" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Attachments;
