import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import io from 'socket.io-client';

const StreamPage = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const socketRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    socketRef.current = io.connect('http://172.17.0.2:3500', { withCredentials: true, reconnection: true, reconnectionAttempts: 5 });
  
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      if (!isStreaming) {
        startStream().catch(error => {
          console.error('Error starting stream:', error);
          stopMediaStream();
        });
      }
    });
  
    socketRef.current.on('stream', ({ streamId }) => {
      setStreamId(streamId);
      setIsStreaming(true);
      if (socketRef.current) {
        socketRef.current.emit('start-stream');
      }
    });
  
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      stopMediaStream();
    });
  
    socketRef.current.on('connect_error', (error) => {
      console.log('Connection error:', error);
    });
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    if (isStreaming && playerRef.current && streamId) {
      setTimeout(() => {
        fetch(`http://172.17.0.2:3500/live/${streamId}.mpd`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Video not available');
            }
            return response.blob();
          })
          .then(blob => {
            playerRef.current.src({
              src: URL.createObjectURL(blob),
              type: 'application/dash+xml',
            });
            playerRef.current.on('loadeddata', function() {
              playerRef.current.play().catch(error => console.error('Error playing video:', error));
            });
          })
          .catch(error => console.error('Error:', error));
      }, 5000); 
    }
  
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isStreaming, streamId]);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, { controls: true, autoplay: false, preload: 'auto' });
    }
  
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const startStream = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('MediaDevices or getUserMedia is not supported in this browser');
      return;
    }
  
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaStreamRef.current = stream;
  
    if (!window.MediaRecorder) {
      console.error('MediaRecorder is not supported in this browser');
      return;
    }
  
    if (socketRef.current) {  
      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'video/webm;codecs=vp8.0,opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              options = { mimeType: 'video/webm;codecs=h264,opus' };
              if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm;codecs=opus' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                  console.error(`${options.mimeType} is not Supported`);
                  options = { mimeType: '' };
                }
              }
            }
          }
        }
      }
  
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorder.ondataavailable = (event) => {
        console.log('MediaRecorder data available:', event.data.size)
        if (event.data && event.data.size > 0) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            console.log('FileReader data:', evt.target.result);
            socketRef.current.emit('stream-data', evt.target.result);
          };
          reader.onerror = function(error) {
            console.error('Error reading data:', error);
          };
          reader.readAsArrayBuffer(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
      };
  
      mediaRecorder.onerror = (event) => {
        console.error('Error recording media:', event.error);
      };
  
      mediaRecorder.start(1000);
      console.log('MediaRecorder started');
      mediaRecorderRef.current = mediaRecorder;
      setIsStreaming(true);
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <button onClick={() => startStream().catch(console.error)} disabled={isStreaming} style={{ position: 'absolute', zIndex: 1 }}>
        {isStreaming ? 'Streaming...' : 'Start Stream'}
      </button>
      {isStreaming && (
        <div data-vjs-player style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <video ref={videoRef} className="video-js vjs-fill" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></video>
        </div>
      )}
    </div>
  );
};

export default StreamPage;