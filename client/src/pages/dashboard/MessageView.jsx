import users from "@/data/users.js";
import {
  CaretDown,
  Gif,
  MagnifyingGlass,
  Microphone,
  PaperPlaneTilt,
  Phone,
  VideoCamera,
} from "@phosphor-icons/react";
import { Divider } from "@mui/material";
import DateSeparator from "@/components/messages/DateSeparator.jsx";
import Text from "@/components/messages/Text.jsx";
import Media from "@/components/messages/Media.jsx";
import MessageHistory from "@/data/messages.js";
import ReplyMessage from "@/components/messages/ReplyMessage.jsx";
import EmojiPicker from "@/components/EmojiPicker.jsx";
import Attachments from "@/components/Attachments.jsx";
import { useState } from "react";
import Giphy from "@/components/Giphy.jsx";

const MessageView = () => {
  const [isGifOpen, setIsGifOpen] = useState(false);
  return (
    <>
      <div
        className={`flex flex-col h-full border-l border-gray-100 dark:border-gray-900 w-4/5`}
      >
        {/* //INFO:Chat Header */}
        <div className="flex sticky items-center justify-between border-b  px-6 py-4 ">
          <div className="flex items-center cursor-pointer">
            <div className="mr-4 h-10 w-full max-w-10 rounded-full overflow-hidden">
              <img
                src={users[0].avatar}
                alt={users[0].name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="w-full">
              <h5 className="font-medium text-black dark:text-white">
                {users[0].name}
              </h5>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {users[0].online ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div className="cursor-pointer flex items-center space-x-6 h-full">
            <button>
              <VideoCamera size={24} color="gray" />
            </button>
            <button>
              <Phone size={24} color="gray" />
            </button>
            <button onClick={() => setAudioCall(true)}>
              <MagnifyingGlass size={24} color="gray" />
            </button>
            <Divider
              orientation="vertical"
              flexItem
              className="bg-gray-100 dark:bg-gray-700"
            />
            <button onClick={() => setAudioCall(true)}>
              <CaretDown size={24} color="gray" />
            </button>
          </div>
        </div>

        {/* //INFO:Chat Messages */}
        <div className="max-h-full space-y-3 overflow-auto no-scrollbar px-6 py-7 grow bg-gray-50 dark:bg-gray-900 shadow-inner">
          {MessageHistory.map((message, index) => {
            if (message.type === "separator") {
              return <DateSeparator key={index} date={message?.date} />;
            } else if (message.type === "text") {
              return (
                <Text
                  key={index}
                  incoming={message?.incoming}
                  timestamp={message?.timestamp}
                  read_receipt={message?.read_receipt}
                  content={message?.content}
                />
              );
            } else if (message.type === "media") {
              return (
                <Media
                  key={index}
                  incoming={message?.incoming}
                  read_receipt={message?.read_receipt}
                  timestamp={message?.timestamp}
                  assets={message?.assets}
                  caption={message?.caption}
                />
              );
            } else if (message.type === "reply") {
              return (
                <ReplyMessage
                  key={index}
                  incoming={message?.incoming}
                  timestamp={message?.timestamp}
                  original={message?.original}
                  content={message?.content}
                  read_receipt={message?.read_receipt}
                />
              );
            }
          })}
        </div>

        {/* //INFO:Chat Input */}
        <div className="sticky bottom-0 p-3 ">
          <form className="flex items-center justify-between space-x-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Message"
                className=" h-12 w-full rounded border border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-900 shadow-inner text-sm outline-none focus:border-blue-950 dark:focus:border-blue-200 text-black dark:text-white pl-5 pr-19"
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-end space-x-4">
                <button>
                  <Microphone size={24} color="gray" weight="bold" />
                </button>
                <Attachments />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsGifOpen(!isGifOpen);
                  }}
                >
                  <Gif size={24} color="gray" weight="bold" />
                </button>
                <EmojiPicker />
              </div>
            </div>

            <button className="flex items-center justify-center h-12 max-w-12 w-full rounded-md bg-blue-500 text-white hover:bg-opacity-80">
              <PaperPlaneTilt size={24} color="white" weight="bold" />
            </button>
          </form>
          {isGifOpen && <Giphy />}
        </div>
      </div>
    </>
  );
};

export default MessageView;
