import React from 'react';
import { Camera } from 'lucide-react';

const LiveCamera = () => {
  // Your active ngrok URL goes here
  const VIDEO_FEED_URL = "https://grueling-absinthe-chief.ngrok-free.dev/video_feed";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Live Hardware Feed</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          <img 
            src={VIDEO_FEED_URL} 
            alt="Live Camera Feed" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              const errorDiv = document.getElementById('cam-error');
              if (errorDiv) errorDiv.style.display = 'block';
            }}
          />
          <div id="cam-error" className="absolute text-white text-center hidden">
            <p className="text-lg font-semibold">Camera feed offline.</p>
            <p className="text-sm text-gray-400">
              1. Make sure elephant_stream.py is running.<br />
              2. Check if ngrok is active in your terminal.<br />
              3. Open the ngrok link in a new tab and click "Visit Site".
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> If the camera feed is not visible, first open{' '}
          <a 
            href="https://grueling-absinthe-chief.ngrok-free.dev" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-bold"
          >
            this link
          </a>{' '}
          in a new tab and click the "Visit Site" button.
        </p>
      </div>
    </div>
  );
};

export default LiveCamera;