// VideoCall.js
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Maximize2,
  Minimize2,
  Monitor,
  MonitorOff,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { socket } from "@/socket.js";

const VideoCall = ({
  isOpen,
  handleClose,
  conversationId,
  userId,
  receiverId,
  receiverName,
  incomingCallData,
  users,
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionState, setConnectionState] = useState("new");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callInitiated) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callInitiated]);

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const setupLocalVideo = useCallback(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, []);

  useEffect(() => {
    setupLocalVideo();
  }, [setupLocalVideo]);

  const setupPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    peerConnectionRef.current = new RTCPeerConnection(servers);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote stream
    peerConnectionRef.current.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        console.log("Sending ICE candidate:", event.candidate);
        socket.emit("ice_candidate", {
          to_user_id: receiverId,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    peerConnectionRef.current.onconnectionstatechange = () => {
      const state = peerConnectionRef.current?.connectionState;
      console.log("Connection state:", state);
      setConnectionState(state);

      if (state === "connected") {
        setIsConnecting(false);
        setErrorMessage("");
      } else if (state === "failed" || state === "disconnected") {
        setErrorMessage("Connection failed. Please try again.");
        setIsConnecting(false);
      } else if (state === "connecting") {
        setIsConnecting(true);
      }
    };

    // Handle ICE connection state
    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const iceState = peerConnectionRef.current?.iceConnectionState;
      console.log("ICE connection state:", iceState);

      if (iceState === "failed") {
        setErrorMessage(
          "Network connection failed. Please check your internet connection."
        );
      }
    };
  }, [receiverId, servers]);

  const startCall = async () => {
    try {
      if (!localStreamRef.current) {
        setErrorMessage(
          "Media not available. Please check camera and microphone permissions."
        );
        return;
      }
      if (!socket?.connected) {
        setErrorMessage(
          "Not connected to server. Please refresh and try again."
        );
        return;
      }

      setIsConnecting(true);
      setErrorMessage("");

      setupPeerConnection();

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("Sending offer to:", receiverId);
      socket.emit("start_video_call", {
        receiver_id: receiverId,
        conversation_id: conversationId,
        offer,
      });

      setCallInitiated(true);
    } catch (error) {
      console.error("Error starting call:", error);
      setErrorMessage("Failed to start call. Please try again.");
      setIsConnecting(false);
    }
  };

  const acceptCall = async () => {
    try {
      if (!incomingCall || !localStreamRef.current) {
        setErrorMessage("No incoming call or media not ready.");
        return;
      }
      if (!socket?.connected) {
        setErrorMessage(
          "Not connected to server. Please refresh and try again."
        );
        return;
      }

      setIsConnecting(true);
      setErrorMessage("");

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
    } catch (error) {
      console.error("Error accepting call:", error);
      setErrorMessage("Failed to accept call. Please try again.");
      setIsConnecting(false);
    }
  };

  const declineCall = () => {
    console.log("Declining call from:", incomingCall?.caller_id);
    if (socket?.connected && incomingCall?.caller_id) {
      socket.emit("end_video_call", { receiver_id: incomingCall.caller_id });
    }
    setIncomingCall(null);
    handleClose();
  };

  const cleanup = useCallback(() => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clean up video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Remove socket listeners
    if (socket) {
      socket.off("video_call_accepted");
      socket.off("ice_candidate");
      socket.off("video_call_ended");
    }

    // Reset states
    setCallInitiated(false);
    setErrorMessage("");
    setIsConnecting(false);
    setCallDuration(0);
    setConnectionState("new");
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  }, []);

  const endCall = () => {
    console.log("Ending call for:", receiverId);
    if (socket?.connected && receiverId) {
      socket.emit("end_video_call", { receiver_id: receiverId });
    }
    cleanup();
    handleClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find((s) => s.track && s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        // Stop screen sharing and switch back to camera
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const videoTrack = videoStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find((s) => s.track && s.track.kind === "video");

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Update local stream
        if (localStreamRef.current) {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          localStreamRef.current = new MediaStream([videoTrack, audioTrack]);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }

        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
      setErrorMessage("Failed to toggle screen sharing.");
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Setup media and socket listeners
  useEffect(() => {
    if (!isOpen || !socket) return;

    const setupMedia = async () => {
      try {
        // Check for permissions first (if supported)
        if (navigator.permissions) {
          try {
            const permissions = await Promise.all([
              navigator.permissions.query({ name: "camera" }),
              navigator.permissions.query({ name: "microphone" }),
            ]);

            const cameraPermission = permissions[0];
            const micPermission = permissions[1];

            if (
              cameraPermission.state === "denied" ||
              micPermission.state === "denied"
            ) {
              setErrorMessage(
                "Camera or microphone access denied. Please check your browser settings and allow access."
              );
              return;
            }
          } catch (permError) {
            console.log(
              "Permissions API not fully supported, proceeding with media request"
            );
          }
        }

        console.log(`Setting up media for user ${userId}`);
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: "user",
            frameRate: { ideal: 30, max: 60 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          },
        });

        localStreamRef.current = localStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        console.log(`Media setup complete for user ${userId}`);
      } catch (error) {
        console.error("Media error for user", userId, ":", error);

        let errorMsg = "Failed to access camera or microphone. ";
        if (error.name === "NotAllowedError") {
          errorMsg +=
            "Please allow camera and microphone access and try again.";
        } else if (error.name === "NotFoundError") {
          errorMsg += "No camera or microphone found on this device.";
        } else if (error.name === "NotReadableError") {
          errorMsg +=
            "Camera or microphone is already in use by another application.";
        } else {
          errorMsg += "Please check your device settings and try again.";
        }

        setErrorMessage(errorMsg);
      }
    };

    // Socket event handlers
    const handleCallAccepted = async ({ answer }) => {
      try {
        console.log(
          `User ${userId} received call acceptance with answer:`,
          answer
        );
        if (peerConnectionRef.current && answer) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          setCallInitiated(true);
          setIsConnecting(false);
        }
      } catch (error) {
        console.error("Error handling call acceptance:", error);
        setErrorMessage("Failed to establish connection.");
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        console.log(`User ${userId} received ICE candidate:`, candidate);
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (error) {
        console.error(
          "Error adding ICE candidate for user",
          userId,
          ":",
          error
        );
      }
    };

    const handleCallEnded = () => {
      console.log(`Call ended by remote user for ${userId}`);
      cleanup();
      handleClose();
    };

    // Register socket listeners
    socket.on("video_call_accepted", handleCallAccepted);
    socket.on("ice_candidate", handleIceCandidate);
    socket.on("video_call_ended", handleCallEnded);

    setupMedia();

    return () => {
      cleanup();
    };
  }, [isOpen, conversationId, userId, receiverId, handleClose, cleanup]);

  // Handle incoming call data from Redux
  useEffect(() => {
    if (incomingCallData && !callInitiated && !incomingCall) {
      console.log("Setting incoming call data:", incomingCallData);
      setIncomingCall({
        caller_id: incomingCallData.caller_id,
        offer: incomingCallData.offer,
      });
    }
  }, [incomingCallData, callInitiated, incomingCall]);

  if (!isOpen) return null;

  console.log(`VideoCall rendered for user ${userId}`);

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 ${
        isFullScreen ? "p-0" : "p-4"
      }`}
    >
      {/* Incoming Call UI */}
      {incomingCall && !callInitiated ? (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4 transform transition-all duration-300 hover:scale-105">
          {/* Avatar and caller info */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                {users?.[0]?.avatar ? (
                  <img
                    src={users[0].avatar}
                    alt={receiverName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {receiverName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Phone size={16} className="text-white" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Incoming Call
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                {receiverName || `User ${incomingCall.caller_id}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Video Call
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-6 mt-8">
            <button
              onClick={declineCall}
              className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <PhoneOff size={24} />
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 active:scale-95"
            >
              <Phone size={24} />
            </button>
          </div>
        </div>
      ) : (
        /* Main Video Call UI */
        <div
          className={`relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isFullScreen
              ? "w-full h-full rounded-none"
              : "w-full max-w-6xl h-4/5"
          }`}
        >
          {/* Header with controls */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      connectionState === "connected"
                        ? "bg-green-500"
                        : connectionState === "connecting" || isConnecting
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-white text-sm font-medium">
                    {connectionState === "connected"
                      ? "Connected"
                      : connectionState === "connecting" || isConnecting
                      ? "Connecting..."
                      : "Disconnected"}
                  </span>
                </div>
                {callInitiated && (
                  <div className="text-white text-sm font-mono bg-black/30 px-3 py-1 rounded-full">
                    {formatDuration(callDuration)}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleFullScreen}
                  className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200 hover:scale-110"
                >
                  {isFullScreen ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Maximize2 size={20} />
                  )}
                </button>
                <button
                  onClick={endCall}
                  className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Video containers */}
          <div className="relative w-full h-full flex">
            {/* Remote video (main) */}
            <div className="flex-1 relative bg-gray-800">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              {!callInitiated && !incomingCall && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                      {users?.[0]?.avatar ? (
                        <img
                          src={users[0].avatar}
                          alt={receiverName}
                          className="w-28 h-28 rounded-full object-cover border-4 border-white"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {receiverName?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-xl font-medium">
                      {receiverName}
                    </p>
                    <p className="text-gray-300">Waiting to connect...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local video (picture-in-picture) */}
            <div className="absolute bottom-6 right-6 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden shadow-lg border-2 border-white/20">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {isVideoOff && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <VideoOff size={32} className="text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="absolute top-20 left-6 right-6 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Loading indicator */}
          {isConnecting && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
                <p className="text-white text-lg font-medium">Connecting...</p>
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-6">
            {!callInitiated && !incomingCall ? (
              <div className="flex justify-center">
                <button
                  onClick={startCall}
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Phone size={20} />
                  <span>Start Call</span>
                </button>
              </div>
            ) : (
              callInitiated && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                      isMuted
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white shadow-lg`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                      isVideoOff
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white shadow-lg`}
                  >
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>

                  <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-full transition-all duration-200 transform hover:scale-110 ${
                      isScreenSharing
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white shadow-lg`}
                  >
                    {isScreenSharing ? (
                      <MonitorOff size={24} />
                    ) : (
                      <Monitor size={24} />
                    )}
                  </button>

                  <button
                    onClick={endCall}
                    className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
