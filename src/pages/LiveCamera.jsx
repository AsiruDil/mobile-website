import React, { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';

const LiveCamera = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [tunnelUrl, setTunnelUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTunnelUrl = async () => {
      try {
        const r = await fetch('https://elephant-guard.onrender.com/api/tunnel/current');
        const data = await r.json();
        if (data.url) {
          setTunnelUrl(data.url);
          setVideoUrl(`${data.url}/video_feed`);
        }
      } catch (e) {
        console.log('Failed to get tunnel URL:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchTunnelUrl();
    const interval = setInterval(fetchTunnelUrl, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-8 h-8 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-800">Live Hardware Feed</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {loading ? (
            <p className="text-white">Loading camera feed...</p>
          ) : videoUrl ? (
            <img
              src={videoUrl}
              alt="Live Camera Feed"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const errorDiv = document.getElementById('cam-error');
                if (errorDiv) errorDiv.style.display = 'block';
              }}
            />
          ) : (
            <p className="text-white">Camera feed offline.</p>
          )}
          <div id="cam-error" className="absolute text-white text-center hidden">
            <p className="text-lg font-semibold">Camera feed offline.</p>
            <p className="text-sm text-gray-400">
              1. Make sure elephant.py is running.<br />
              2. Check if localtunnel is active.<br />
            </p>
          </div>
        </div>
      </div>

      {tunnelUrl && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> If the camera feed is not visible, first open{' '}
            <a
              href={tunnelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold"
            >
              this link
            </a>{' '}
            in a new tab and click the "Visit Site" button.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveCamera;