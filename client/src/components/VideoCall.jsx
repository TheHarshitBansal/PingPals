// VideoCall.js
import { X, Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket.js";

const VideoCall = ({
  isOpen,
  handleClose,
  conversationId,
  userId,
  receiverId,
  receiverName,
  incomingCallData,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callInitiated, setCallInitiated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);

  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  };

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]);

  useEffect(() => {
    if (callInitiated && remoteVideoRef.current && peerConnectionRef.current) {
      const remoteStream = peerConnectionRef.current.getRemoteStreams()[0];
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [callInitiated]);

  const setupPeerConnection = () => {
    peerConnectionRef.current = new RTCPeerConnection(servers);
    const remoteStream = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    localStreamRef.current?.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          to_user_id: receiverId,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionRef.current.onconnectionstatechange = () => {
      "Connection state:", peerConnectionRef.current.connectionState;
      console.log;
    };
  };

  const startCall = async () => {
    if (!localStreamRef.current) {
      setErrorMessage(
        "Media not available yet. Please wait or check permissions."
      );
      return;
    }
    if (!socket || !socket.connected) {
      setErrorMessage("Socket not connected. Please try again.");
      return;
    }
    setupPeerConnection();
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    console.log("Sending offer to:", receiverId);
    socket.emit("start_video_call", {
      receiver_id: receiverId,
      conversation_id: conversationId,
      offer,
    });
    setCallInitiated(true);
  };

  const acceptCall = async () => {
    if (!incomingCall || !localStreamRef.current) {
      setErrorMessage("No incoming call or media not ready.");
      return;
    }
    if (!socket || !socket.connected) {
      setErrorMessage("Socket not connected. Please try again.");
      return;
    }
    setupPeerConnection();
    console.log("Accepting call from:", incomingCall.caller_id);
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    console.log("Sending answer to:", incomingCall.caller_id);
    socket.emit("accept_video_call", {
      caller_id: incomingCall.caller_id,
      conversation_id: conversationId,
      answer,
    });
    setIncomingCall(null);
    setCallInitiated(true);
  };

  const declineCall = () => {
    console.log("Declining call from:", incomingCall?.caller_id);
    setIncomingCall(null);
    handleClose();
  };

  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    socket.off("video_call_accepted");
    socket.off("ice_candidate");
    socket.off("video_call_ended");
    setCallInitiated(false);
    setErrorMessage("");
  };

  const endCall = () => {
    console.log("Ending call for:", receiverId);
    socket?.emit("end_video_call", { receiver_id: receiverId });
    cleanup();
    handleClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const initiateCall = () => {
    startCall();
  };

  useEffect(() => {
    if (!isOpen || !socket) return;

    const setupMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        console.log(`Media setup complete for user ${userId}`);
      } catch (error) {
        setErrorMessage(
          "Failed to access camera or microphone. Please check permissions."
        );
        console.error("Media error for user", userId, ":", error);
      }
    };

    socket.on("video_call_accepted", async ({ answer }) => {
      console.log(
        `User ${userId} received call acceptance with answer:`,
        answer
      );
      await peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallInitiated(true);
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      console.log(`User ${userId} received ICE candidate:`, candidate);
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.error("Error adding ICE candidate for user", userId, ":", e);
      }
    });

    socket.on("video_call_ended", () => {
      console.log(`Call ended by remote user for ${userId}`);
      cleanup();
      handleClose();
    });

    setupMedia();

    return () => {
      cleanup();
    };
  }, [isOpen, conversationId, userId, receiverId, handleClose]);

  useEffect(() => {
    if (!socket) return;
    console.log(
      `Socket status for user ${userId}: ${
        socket.connected ? "Connected" : "Disconnected"
      }`
    );
  }, [socket, userId]);

  useEffect(() => {
    if (incomingCallData && !callInitiated && !incomingCall) {
      setIncomingCall({
        caller_id: incomingCallData.caller_id,
        offer: incomingCallData.offer,
      });
    }
  }, [incomingCallData, callInitiated, incomingCall]);

  if (!isOpen) return null;

  console.log(`VideoCall rendered for user ${userId}`);

  return (
    <div className="absolute top-0 left-0 bg-black bg-opacity-50 h-screen w-screen flex items-center justify-center z-50">
      {incomingCall && !callInitiated ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-black dark:text-white">
            Incoming Call
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            From: {receiverName || `User ${incomingCall.caller_id}`}
          </p>
          <div className="mt-4 flex space-x-4">
            <button
              onClick={acceptCall}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={declineCall}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Decline
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-gray-300 dark:bg-gray-900 h-[50%] w-[80%] z-0 rounded-2xl">
          <X
            size={24}
            color="white"
            weight="bold"
            onClick={endCall}
            className="absolute right-5 top-5 cursor-pointer z-10"
          />
          <div className="flex w-full h-full justify-between p-10">
            <video
              ref={localVideoRef}
              className="w-[49%] h-4/5 bg-black object-cover rounded-xl"
              autoPlay
              playsInline
              muted
            />
            <video
              ref={remoteVideoRef}
              className="w-[49%] h-4/5 bg-black rounded-xl object-cover"
              autoPlay
              playsInline
            />
          </div>
          {errorMessage && (
            <div className="absolute top-5 left-5 bg-red-500 text-white p-2 rounded">
              {errorMessage}
            </div>
          )}
          {!callInitiated && !incomingCall && (
            <button
              onClick={initiateCall}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Start Call
            </button>
          )}
          {callInitiated && (
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={toggleMute}
                className="p-2 bg-gray-700 rounded-full"
              >
                {isMuted ? (
                  <MicOff size={28} color="white" />
                ) : (
                  <Mic size={28} color="white" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className="p-2 bg-gray-700 rounded-full"
              >
                {isVideoOff ? (
                  <VideoOff size={28} color="white" />
                ) : (
                  <Video size={28} color="white" />
                )}
              </button>
              <button onClick={endCall} className="p-2 bg-red-500 rounded-full">
                <PhoneOff size={28} color="white" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoCall;
