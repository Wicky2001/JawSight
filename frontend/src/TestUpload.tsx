import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

const TestUpload: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.emit("register", "doc_123");
    newSocket.on("prediction_complete", (data) => {
      
      setIsLoading(false);
      setResult(data);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleUpload = async () => {
    setIsLoading(true);
    setResult(null);
    

    try {
      const url = 'http://localhost:5000/api/predictions/upload';
      const payload = {
        doctor_id: 'doc_123',
        patient_id: 'pat_456',
        imageUrl: 'https://example.com/image1.jpg',
        iterationId: 'iter_001',
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      setResult(json);
      //generate tosify images successfully uploaded to model
    } catch (err: any) {
      setResult({ error: err?.message || String(err) });
      //generate tosify error message
      setIsLoading(false);
    } 
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-10">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Simulate Upload & Prediction"}
      </button>
      {isLoading && <div className="mt-4">Loading prediction...</div>}
 
    </div>
  );
};

export default TestUpload;
