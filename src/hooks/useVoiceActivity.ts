'use client';

import { useEffect, useRef, useState } from 'react';

// Add this at the very top of the file:
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface UseVoiceActivityOptions {
  threshold?: number;
  interval?: number;
  onActivityChange?: (isActive: boolean) => void;
}

export const useVoiceActivity = ({
  threshold = 0.01,
  interval = 100,
  onActivityChange
}: UseVoiceActivityOptions = {}) => {
  const [isActive, setIsActiveState] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const currentIsActive = useRef(false);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const animationFrame = useRef<number | null>(null);

  // Custom setter that updates both state and ref
  const setIsActive = (newState: boolean) => {
    currentIsActive.current = newState;
    setIsActiveState(newState);
  };

  useEffect(() => {
    // Check if browser supports required APIs
    setIsSupported(
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia &&
      typeof AudioContext !== 'undefined'
    );
  }, []);

  const startListening = async () => {
    if (!isSupported) {
      console.warn('Voice activity detection not supported');
      return;
    }

    try {
      console.log('Requesting microphone access...');
      
      // Get microphone access with better constraints
      mediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Turn off for better raw audio detection
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        }
      });

      console.log('Microphone access granted, setting up audio context...');

      // Create audio context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext.current = new AudioContextClass();
      
      // Resume if suspended
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
        console.log('Audio context resumed');
      }
      
      console.log('Audio context state:', audioContext.current.state);
      
      // Create analyser
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 512;
      analyser.current.smoothingTimeConstant = 0.3;
      
      // Connect source
      const source = audioContext.current.createMediaStreamSource(mediaStream.current);
      source.connect(analyser.current);

      // Fix the Uint8Array creation
      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(new ArrayBuffer(bufferLength));
      
      console.log('Audio setup complete. Buffer size:', dataArray.current.length);

      // Monitoring function
      const monitor = () => {
        if (!analyser.current || !dataArray.current) return;

        // Get frequency data with type assertion to fix TypeScript issue
        try {
          (analyser.current as any).getByteFrequencyData(dataArray.current);
        } catch (error) {
          console.error('Error getting frequency data:', error);
          return;
        }
        
        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < dataArray.current.length; i++) {
          sum += dataArray.current[i];
        }
        const average = sum / dataArray.current.length;
        const normalizedVolume = average / 128; // Normalize to 0-2 range
        
        const newIsActive = normalizedVolume > threshold;
        
        // Debug output every 30 frames (~0.5 seconds)
        if (Math.random() < 0.033) {
          console.log('Audio level:', normalizedVolume.toFixed(3), 'Active:', newIsActive, 'Current state:', currentIsActive.current);
        }
        
        // Always check against the ref value, not the state
        if (newIsActive !== currentIsActive.current) {
          console.log('Voice activity changed:', currentIsActive.current, '->', newIsActive, 'Level:', normalizedVolume.toFixed(3));
          setIsActive(newIsActive);
          onActivityChange?.(newIsActive);
        }

        animationFrame.current = requestAnimationFrame(monitor);
      };

      // Start monitoring
      monitor();
      console.log('Voice monitoring started');

    } catch (error) {
      console.error('Error setting up voice detection:', error);
      alert('Could not access microphone: ' + error);
    }
  };

  const stopListening = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }

    analyser.current = null;
    dataArray.current = null;
    
    // Reset both state and ref
    if (currentIsActive.current) {
      setIsActive(false);
      onActivityChange?.(false);
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    isActive,
    isSupported,
    startListening,
    stopListening
  };
};