import React from 'react';
import { Camera } from 'lucide-react';

const LiveCamera = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Live Hardware Feed</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src="http://localhost:5000/video_feed" 
            alt="Live Camera Feed" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              document.getElementById('cam-error').style.display = 'block';
            }}
          />
          <div id="cam-error" className="absolute text-white text-center hidden">
            <p>Camera feed offline.</p>
            <p className="text-sm text-gray-400">Make sure elephant_stream.py is running.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;