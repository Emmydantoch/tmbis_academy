import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LiveSession({
  sessionTitle = "Live Coaching: User Research Methods",
  lecturerName = "Dr. Sarah Chen",
}) {
  const videoRef = useRef(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stream, setStream] = useState(null);
  const [liveTime, setLiveTime] = useState(0);

  // Start Live Session
  const joinSession = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsJoined(true);
      
      // Start live timer
      const interval = setInterval(() => {
        setLiveTime(prev => prev + 1);
      }, 1000);
      
      // Save interval ID for cleanup
      videoRef.current.dataset.intervalId = interval;
      
    } catch (err) {
      alert("Unable to access camera/microphone. Please allow permissions.");
      console.error(err);
    }
  };

  // Leave Session
  const leaveSession = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current && videoRef.current.dataset.intervalId) {
      clearInterval(videoRef.current.dataset.intervalId);
    }
    setIsJoined(false);
    setLiveTime(0);
    setStream(null);
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(!isMicOn);
      }
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    const element = document.getElementById('live-video-container');
    if (!document.fullscreenElement) {
      element.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format live time
  const formatLiveTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar (same as before) */}
      <nav className="hidden md:flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        {/* ... Sidebar content ... */}
      <div className="mb-8 px-2">
          <h1 className="font-headline-lg font-bold text-primary">TMBIS Academy</h1>
          <p className="text-on-surface-variant text-sm">Student Portal</p>
        </div>  
        <div className="flex-1 space-y-1">
          <NavItem to="/" icon="" label="Landing Page" />
      
          <NavItem icon="account_balance_wallet" label="Live Sessions" active />
        </div>
      </nav>

      <div className="flex-1 md:ml-64 flex flex-col h-screen">
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center px-6">
          <h1 className="font-headline-md font-bold text-primary">TMBIS Academy - Live Session</h1>
        </header>

        <main className="flex-1 p-6 md:p-8 flex items-center justify-center bg-black">
          <div id="live-video-container" className="w-full max-w-5xl bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant shadow-2xl relative">
            
            {!isJoined ? (
              /* Waiting Screen */
              <div className="aspect-video flex flex-col items-center justify-center text-center p-10">
                <div className="w-28 h-28 rounded-3xl bg-primary/10 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-7xl text-primary">videocam</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">{sessionTitle}</h2>
                <p className="text-on-surface-variant mb-8">with {lecturerName}</p>
                
                <button
                  onClick={joinSession}
                  className="bg-primary hover:bg-primary/90 text-on-primary px-12 py-5 rounded-2xl text-xl font-bold transition-all active:scale-95"
                >
                  Join Live Session
                </button>
              </div>
            ) : (
              /* Live Session Screen */
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Live Indicator */}
                <div className="absolute top-6 left-6 bg-red-600 text-white text-sm px-4 py-1.5 rounded-full flex items-center gap-2 font-medium">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  LIVE • {formatLiveTime(liveTime)}
                </div>

                {/* Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleMic}
                        className={`p-4 rounded-2xl text-2xl transition-all ${isMicOn ? 'bg-white/20' : 'bg-red-600'}`}
                      >
                        <span className="material-symbols-outlined">{isMicOn ? 'mic' : 'mic_off'}</span>
                      </button>

                      <button
                        onClick={toggleCamera}
                        className={`p-4 rounded-2xl text-2xl transition-all ${isCameraOn ? 'bg-white/20' : 'bg-red-600'}`}
                      >
                        <span className="material-symbols-outlined">{isCameraOn ? 'videocam' : 'videocam_off'}</span>
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="p-4 rounded-2xl text-2xl bg-white/20 hover:bg-white/30 transition-all"
                      >
                        <span className="material-symbols-outlined">fullscreen</span>
                      </button>
                    </div>

                    <button
                      onClick={leaveSession}
                      className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 text-white"
                    >
                      <span className="material-symbols-outlined">call_end</span>
                      Leave Session
                    </button>
                  </div>
                </div>

                {/* Lecturer / Peer Video Overlay */}
                <div className="absolute bottom-24 right-6 w-56 aspect-video bg-surface-container-high rounded-2xl overflow-hidden border-2 border-primary/50">
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-white text-sm">
                    Dr. {lecturerName}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-primary text-on-primary'
          : 'hover:bg-surface-container text-on-surface-variant'
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </a>
  );
}