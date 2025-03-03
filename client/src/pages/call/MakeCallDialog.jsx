import { Button } from "@/components/ui/button.jsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.jsx";
import { resetCallQueue } from "@/redux/slices/callSlice.js";
import { socket } from "@/socket.js";
import { CheckIcon, ChevronsUpDown, Phone, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";

const MakeCallDialog = ({ children }) => {
  const StreamRef = useRef(null);
  const currentConversation = useSelector(
    (state) => state.conversation.currentConversation
  );
  const { user, token } = useSelector((state) => state.auth);
  const { friends } = useSelector((state) => state.app);
  const callDetails = useSelector((state) => state.call.callQueue);

  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!dialogOpen) {
      setUsers([]);
    }
  }, [dialogOpen]);

  useEffect(() => {
    if (friends.length > 0) {
      setUsers(friends);
    }
  }, [friends]);

  const appId = import.meta.env.VITE_ZEGO_APP_ID;
  const server = import.meta.env.VITE_ZEGO_SERVER_URL;

  const roomId = currentConversation ? currentConversation._id : "";
  const userId = user._id;
  const userName = user._id;

  //INFO: Initialize ZegoExpressEngine
  const zg = new ZegoExpressEngine(appId, server);

  const streamID = callDetails?.streamID;

  const handleDisconnect = (event, reason) => {
    if (reason && reason === "backdropClick") {
      return;
    } else {
      dispatch(resetCallQueue());

      // clean up event listners
      socket?.off("call_accepted");
      socket?.off("call_denied");
      socket?.off("call_missed");

      // stop publishing local audio stream to remote users, call the stopPublishingStream method with the corresponding stream ID passed to the streamID parameter.
      zg.stopPublishingStream(streamID);
      // stop playing a remote audio
      zg.stopPlayingStream(userId);
      // destroy stream
      zg.destroyStream(StreamRef.current);
      // log out of the room
      zg.logoutRoom(roomId);

      // handle Call Disconnection => this will be handled as cleanup when this dialog unmounts

      // at the end call handleClose Dialog
      handleClose();
    }
  };

  useEffect(() => {
    // TODO => emit audio_call event
    socket.emit();

    // create a job to decline call automatically after 30 sec if not picked

    const timer = setTimeout(() => {
      // TODO => You can play an audio indicating missed call at this line at sender's end

      socket.emit("call_not_picked", { to: streamID, from: userId }, () => {
        // TODO abort call => Call verdict will be marked as Missed
      });
    }, 30 * 1000);

    socket.on("audio_call_missed", () => {
      // TODO => You can play an audio indicating call is missed at receiver's end
      // Abort call
      handleDisconnect();
    });

    socket.on("audio_call_accepted", () => {
      // TODO => You can play an audio indicating call is started
      // clear timeout for "audio_call_not_picked"
      clearTimeout(timer);
    });

    if (!incoming) {
      socket.emit("start_audio_call", {
        to: streamID,
        from: userID,
        roomID,
      });
    }

    socket.on("audio_call_denied", () => {
      // TODO => You can play an audio indicating call is denined
      // ABORT CALL
      handleDisconnect();
    });

    // make a POST API call to server & fetch token

    let this_token;

    async function fetchToken() {
      // You can await here
      const response = await axiosInstance.post(
        "/user/generate-zego-token",
        {
          userId: userID,
          room_id: roomID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response, "TOKEN RESPONSE");
      this_token = response.data.token;
      // ...
    }
    fetchToken();

    // Step 2 => Check browser compatibility

    zg.checkSystemRequirements()
      .then((result) => {
        // The [result] indicates whether it is compatible. It indicates WebRTC is supported when the [webRTC] is [true]. For more results, see the API documents.

        // {
        //   webRTC: true,
        //   customCapture: true,
        //   camera: true,
        //   microphone: true,
        //   videoCodec: { H264: true, H265: false, VP8: true, VP9: true },
        //   screenSharing: true,
        //   errInfo: {}
        // }
        console.log(result);

        const { webRTC, microphone } = result;

        if (webRTC && microphone) {
          zg.loginRoom(
            roomID,
            this_token,
            { userID, userName },
            { userUpdate: true }
          )
            .then(async (result) => {
              console.log(result);

              // After calling the CreateStream method, you need to wait for the ZEGOCLOUD server to return the local stream object before any further operation.
              const localStream = await zg.createStream({
                camera: { audio: true, video: false },
              });

              audioStreamRef.current = localStream;

              // Get the audio tag.
              const localAudio = document.getElementById("local-audio");
              // The local stream is a MediaStream object. You can render audio by assigning the local stream to the srcObject property of video or audio.
              localAudio.srcObject = localStream;

              // localStream is the MediaStream object created by calling creatStream in the previous step.
              zg.startPublishingStream(streamID, localStream);

              zg.on("publisherStateUpdate", (result) => {
                // Callback for updates on stream publishing status.
                // ...
                console.log(result);
                // * we can use this info to show connection status
              });

              zg.on("publishQualityUpdate", (streamID, stats) => {
                // Callback for reporting stream publishing quality.
                // ...
                // console.log(streamID, stats);
                // * we can use this info to show local audio stream quality
              });
            })
            .catch((error) => {
              console.log(error);
            });

          // Callback for updates on the current user's room connection status.
          zg.on("roomStateUpdate", (roomID, state, errorCode, extendedData) => {
            if (state === "DISCONNECTED") {
              // Disconnected from the room
              // * Can be used to show disconnected status for a user (especially useful in a group call)
            }

            if (state === "CONNECTING") {
              // Connecting to the room
              // * Can be used to show connecting status for a user (especially useful in a group call)
            }

            if (state === "CONNECTED") {
              // Connected to the room
              // * Can be used to show connected status for a user (especially useful in a group call)
            }
          });

          // Callback for updates on the status of ther users in the room.
          zg.on("roomUserUpdate", async (roomID, updateType, userList) => {
            console.warn(
              `roomUserUpdate: room ${roomID}, user ${
                updateType === "ADD" ? "added" : "left"
              } `,
              JSON.stringify(userList)
            );
            if (updateType !== "ADD") {
              handleDisconnect();
            } else {
              // const current_users = JSON.stringify(userList);
              // * We can use current_users_list to build dynamic UI in a group call
              const remoteStream = await zg.startPlayingStream(userID);

              // Get the audio tag.
              const remoteAudio = document.getElementById("remote-audio");
              // The local stream is a MediaStream object. You can render audio by assigning the local stream to the srcObject property of video or audio.

              remoteAudio.srcObject = remoteStream;
              remoteAudio.play();
            }
          });

          // Callback for updates on the status of the streams in the room.
          zg.on(
            "roomStreamUpdate",
            async (roomID, updateType, streamList, extendedData) => {
              if (updateType === "ADD") {
                // New stream added, start playing the stream.
                console.log(
                  "ADD",
                  roomID,
                  updateType,
                  streamList,
                  extendedData
                );

                // * It would be quite useful to create and play multiple audio streams in a group call
              } else if (updateType === "DELETE") {
                // Stream deleted, stop playing the stream.
                console.log(
                  "DELETE",
                  roomID,
                  updateType,
                  streamList,
                  extendedData
                );

                // * Can be used to drop audio streams (more useful in a group call)
              }
            }
          );

          zg.on("playerStateUpdate", (result) => {
            // Callback for updates on stream playing status.
            // ...
            // * Can be used to display realtime status of a remote audio stream (Connecting, connected & Disconnected)
          });

          zg.on("playQualityUpdate", (streamID, stats) => {
            // Callback for reporting stream playing quality.
            // * Can be used to display realtime quality of a remote audio stream
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[40%]">
        <DialogHeader>
          <DialogTitle className="text-lg">Make a Call</DialogTitle>
        </DialogHeader>
        <DialogDescription className="w-full" asChild>
          <Popover open={open} onOpenChange={setOpen} className="!w-full">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedUser ? selectedUser.name : "Select Contact..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command className="w-full">
                <CommandInput
                  placeholder="Search Contacts..."
                  className="h-9 w-full"
                />
                <CommandList className="w-full">
                  <CommandEmpty>No User found.</CommandEmpty>
                  <CommandGroup className="w-full">
                    {users.map((contact, idx) => (
                      <CommandItem
                        className="w-full flex justify-between items-center"
                        key={contact._id}
                        name={contact.name}
                        onSelect={(currentUser) => {
                          const selected = users.find(
                            (user) => user.name === currentUser
                          );
                          setSelectedUser(selected);
                          setOpen(false);
                        }}
                      >
                        {contact.name}
                        <CheckIcon
                          className={
                            selectedUser?._id === contact._id
                              ? "opacity-100"
                              : "opacity-0"
                          }
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            className="text-green-500 dark:text-green-400 border border-green-500 dark:border-green-400 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white hover:dark:text-white"
          >
            <Phone /> Voice Call
          </Button>
          <Button
            variant="outline"
            className="text-green-500 dark:text-green-400 border border-green-500 dark:border-green-400 hover:bg-green-500 dark:hover:bg-green-400 hover:text-white hover:dark:text-white"
          >
            <Video /> Video Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default MakeCallDialog;
