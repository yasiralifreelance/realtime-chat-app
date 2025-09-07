'use client';

import { useRef, useState } from 'react';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recordingStartTime = useRef<number>(0);

  const startRecording = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start(250); // Collect data every 250ms
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsSupported(false);
      return false;
    }
  };

  const stopRecording = (): Promise<{ audioBlob: Blob; duration: number } | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current || !isRecording) {
        resolve(null);
        return;
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm;codecs=opus' });
        const duration = (Date.now() - recordingStartTime.current) / 1000;
        
        // Stop all tracks
        if (mediaRecorder.current?.stream) {
          mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
        
        resolve({ audioBlob, duration });
      };

      mediaRecorder.current.stop();
      setIsRecording(false);
    });
  };

  const cancelRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (mediaRecorder.current.stream) {
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      audioChunks.current = [];
    }
  };

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording
  };
};