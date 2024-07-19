// utils/webrtc.ts

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import SimplePeer, { SignalData } from "simple-peer";

const socket: Socket = io("http://localhost:3001"); // Your signaling server URL

type UseWebRTCReturnType = {
  createPeer: () => SimplePeer.Instance;
  acceptPeer: (offer: SignalData) => void;
  myId: string;
  socket: Socket;
};

const useWebRTC = (): UseWebRTCReturnType => {
  const [myId, setMyId] = useState<string>("");
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const socketRef = useRef<Socket>(socket);

  useEffect(() => {
    socketRef.current = socket;

    socketRef.current.on("connect", () => {
      const id = socketRef.current.id || ""; // Ensure it's always a string
      setMyId(id);
      console.log("Connected to signaling server with ID:", id);
    });

    socketRef.current.on("offer", (payload) => {
      acceptPeer(payload.signal);
    });

    socketRef.current.on("answer", (payload) => {
      if (peerRef.current) {
        peerRef.current.signal(payload.signal);
      }
    });

    socketRef.current.on("ice-candidate", (incoming) => {
      if (peerRef.current) {
        peerRef.current.signal(incoming.candidate);
      }
    });

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socketRef.current.disconnect();
    };
  }, []);

  const createPeer = (): SimplePeer.Instance => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
    });

    peer.on("signal", (data: SignalData) => {
      socketRef.current.emit("offer", { target: myId, signal: data });
    });

    peerRef.current = peer;

    return peer;
  };

  const acceptPeer = (offer: SignalData): void => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
    });

    peer.on("signal", (data: SignalData) => {
      socketRef.current.emit("answer", { target: myId, signal: data });
    });

    peer.signal(offer);

    peerRef.current = peer;
  };

  return { createPeer, acceptPeer, myId, socket: socketRef.current };
};

export default useWebRTC;
