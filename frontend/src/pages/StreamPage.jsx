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
  const livePlayerRef = useRef(null); // Add this line
  const liveVideoRef = useRef(null); // Add this line


  useEffect(() => {
    socketRef.current = io.connect('http://localhost:3500', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('Connection error:', error);
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      // Emit 'start-stream' event to the server
      socketRef.current.emit('start-stream');
    });

    socketRef.current.on('webrtc-signal', (data) => {
      console.log('Received webrtc signal:', data);
      // Save the received streamId
      if (data.streamId) {
        setStreamId(data.streamId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      stopMediaStream();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    if (isStreaming && livePlayerRef.current && streamId) {
      const livePlayer = videojs(liveVideoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
      });
      livePlayerRef.current = livePlayer;

      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('request-video', streamId); // Use the streamId from state
        }
      }, 500);
      setIsStreaming(false);
    }

    return () => {
      if (livePlayerRef.current) {
        livePlayerRef.current.dispose();
        livePlayerRef.current = null;
      }
    };
  }, [isStreaming, streamId]);

  useEffect(() => {
    socketRef.current.on('video-chunk', ({ streamId, chunk }) => {
      console.log('Received video chunk:', streamId, chunk);
      if (livePlayerRef.current) {
        livePlayerRef.current.srcObject = new MediaSource();
        livePlayerRef.current.srcObject.addEventListener('sourceopen', function () {
          const sourceBuffer = this.addSourceBuffer('video/webm; codecs="vp8, vorbis"');
          sourceBuffer.addEventListener('updateend', function () {
            livePlayerRef.current.play();
          });
          sourceBuffer.appendBuffer(new Uint8Array(chunk));
        });
      }
    });

    return () => {
      if (livePlayerRef.current) {
        livePlayerRef.current.dispose();
        livePlayerRef.current = null;
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
  
    // Check if isStreaming is true before accessing videoRef.current
    if (isStreaming) {
      videoRef.current.srcObject = stream;
    }

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
        console.log('MediaRecorder data available:', event.data.size);
        if (event.data && event.data.size > 0) {
          // Emit the ArrayBuffer directly
          socketRef.current.emit('stream-data', { streamId, chunk: event.data }); // Use the streamId from state
        }
      };

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
      };

      mediaRecorder.onerror = (event) => {
        console.error('Error recording media:', event.error);
      };

      mediaRecorder.start(50);

      console.log('MediaRecorder started');
      mediaRecorderRef.current = mediaRecorder;
      setIsStreaming(true);
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
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
        <div>
          <video ref={videoRef} className="video-js vjs-default-skin" autoPlay />
          <video ref={liveVideoRef} className="video-js vjs-default-skin" />
        </div>
      )}
    </div>
  );
};

export default StreamPage;
