"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { NextPage } from "next";
import styles from "./style.css";

let socket: ReturnType<typeof io> | null = null;

const Home: NextPage = () => {
  const [room, setRoom] = useState<string>("");
  const [newRoom, setNewRoom] = useState<string>("");
  const [rooms, setRooms] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    socket = io("http://localhost:3001");

    socket.on("roomCreated", (room: string) => {
      setRooms((prevRooms) => [...prevRooms, room]);
    });

    socket.on("invalidRoom", (room: string) => {
      alert(`Room "${room}" is not valid`);
    });

    socket.on("joinSuccess", (room: string) => {
      console.log(`Successfully joined room: ${room}`);
      router.push(`/chat/${room}`);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (room) {
      console.log(`Attempting to join room: ${room}`);
      socket?.emit("joinRoom", room);
    }
  };

  const handleCreateRoom = () => {
    if (newRoom) {
      console.log(`Creating room: ${newRoom}`);
      socket?.emit("createRoom", newRoom);
      setNewRoom("");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Join a Room</h1>
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name"
        className={styles.input}
      />
      <button onClick={handleJoinRoom} className={styles.button}>
        Join Room
      </button>

      <h1>Create a New Room</h1>
      <input
        type="text"
        value={newRoom}
        onChange={(e) => setNewRoom(e.target.value)}
        placeholder="Enter new room name"
        className={styles.input}
      />
      <button onClick={handleCreateRoom} className={styles.button}>
        Create Room
      </button>

      <h2>Available Rooms</h2>
      <ul className={styles.roomList}>
        {rooms.map((room, index) => (
          <li key={index} onClick={() => setRoom(room)} className={styles.roomItem}>
            {room}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
