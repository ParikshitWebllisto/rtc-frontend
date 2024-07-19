"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

const ChatRoom = ({ params: { room } }: { params: { room: string } }) => {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket = io("http://localhost:3001");

    if (room) {
      socket.emit("joinRoom", room);

      socket.on("message", (message: string) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on("previousMessages", (previousMessages: string[]) => {
        setMessages(previousMessages);
      });

      socket.on("invalidRoom", (room: string) => {
        alert(`Room "${room}" is not valid`);
        router.push("/");
      });

      socket.on("joinSuccess", (room: string) => {
        console.log(`Successfully joined room: ${room}`);
      });

      return () => {
        socket?.disconnect();
      };
    }
  }, [room]);

  const sendMessage = () => {
    if (message && room) {
      socket?.emit("message", { room, message });
      setMessage("");
    }
  };

  return (
    <div className={"container"}>
      <div className={"header"}>
        <h1>Room: {room}</h1>
      </div>
      <div className={"messages"}>
        {messages.map((msg, index) => (
          <div key={index} className={"message"}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
        className={"input"}
      />
      <button onClick={sendMessage} className={"button"}>
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
