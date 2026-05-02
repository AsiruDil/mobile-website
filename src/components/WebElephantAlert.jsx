import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AlertTriangle } from 'lucide-react';

const WebElephantAlert = () => {
  const [alertData, setAlertData] = useState(null);
  const audioRef = useRef(new Audio('/alert.wav'));

  useEffect(() => {
    audioRef.current.loop = true;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-elephant'),
      onConnect: () => {
        console.log('Connected to Elephant Alert System');
        stompClient.subscribe('/topic/alerts', (message) => {
          const data = JSON.parse(message.body);
          setAlertData(data);
          audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
        });
      },
      onStompError: (frame) => console.error('Broker error: ' + frame.headers['message']),
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
      audioRef.current.pause();
    };
  }, []);

  const dismissAlert = () => {
    setAlertData(null);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  if (!alertData) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 text-center animate-in zoom-in duration-300">
        <AlertTriangle className="w-24 h-24 text-red-600 mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-red-600 mb-4 tracking-tight">
          ELEPHANT DETECTED
        </h1>
        <p className="text-xl text-gray-800 font-medium mb-8">
          {alertData.message || "An elephant has crossed the boundary line."}
        </p>
        <button 
          onClick={dismissAlert}
          className="bg-gray-900 hover:bg-black text-white text-lg font-bold py-4 px-12 rounded-full transition-transform hover:scale-105 shadow-xl"
        >
          Acknowledge & Dismiss
        </button>
      </div>
    </div>
  );
};

export default WebElephantAlert;