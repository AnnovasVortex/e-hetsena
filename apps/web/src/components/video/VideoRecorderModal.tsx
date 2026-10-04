'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Square, Play, Pause, RotateCcw, Check, X } from 'lucide-react';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoReady: (data: { file: File; thumbnailUrl: string; duration: number }) => void;
}

export function VideoRecorderModal({
  isOpen,
  onClose,
  onVideoReady,
}: VideoRecorderModalProps) {
  const [mode, setMode] = useState<'RECORD' | 'PREVIEW'>('RECORD');
  const [maxDuration, setMaxDuration] = useState<number>(30); // 15, 30 ou 60 secondes
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialisation de la caméra mobile
  useEffect(() => {
    if (isOpen && mode === 'RECORD') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Caméra arrière par défaut pour filmer le produit
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Accès caméra direct impossible, proposition d'import galerie :", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Chronomètre pendant l'enregistrement
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, maxDuration]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/mp4',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setMode('PREVIEW');
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000); // Découpe toutes les 1s
    setIsRecording(true);
    setRecordingSeconds(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Import direct depuis la galerie
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMode('PREVIEW');
      stopCamera();
    }
  };

  // Capture de la miniature (Thumbnail) sur Canvas
  const captureThumbnail = () => {
    if (!videoPreviewRef.current) return;
    const video = videoPreviewRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 854;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumb = canvas.toDataURL('image/webp', 0.8);
      setThumbnailUrl(thumb);
    }
  };

  const handleConfirm = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `video_${Date.now()}.mp4`, {
      type: 'video/mp4',
    });

    onVideoReady({
      file,
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500',
      duration: recordingSeconds || 15,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4 max-w-lg mx-auto">
      {/* Barre supérieure */}
      <div className="flex items-center justify-between z-10 text-white">
        <button onClick={onClose} className="p-2 rounded-full bg-white/20">
          <X className="w-5 h-5" />
        </button>

        {mode === 'RECORD' && (
          <div className="flex gap-2 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20">
            {[15, 30, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => setMaxDuration(sec)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  maxDuration === sec ? 'bg-[#D35400] text-white' : 'text-stone-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        )}

        <div className="w-9" />
      </div>

      {/* Zone Vidéo principale (Format vertical 9:16) */}
      <div className="relative flex-1 my-4 rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center">
        {mode === 'RECORD' ? (
          <>
            <video
              ref={videoLiveRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>
                  00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:
                  {maxDuration}
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <video
              ref={videoPreviewRef}
              src={previewUrl || ''}
              playsInline
              onLoadedData={captureThumbnail}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                if (videoPreviewRef.current) {
                  if (isPlaying) videoPreviewRef.current.pause();
                  else videoPreviewRef.current.play();
                  setIsPlaying(!isPlaying);
                }
              }}
              className="absolute inset-0 m-auto w-14 h-14 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-xs"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </>
        )}
      </div>

      {/* Commandes inférieures */}
      <div className="flex items-center justify-around py-4">
        {mode === 'RECORD' ? (
          <>
            {/* Import Galerie */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1 text-white text-xs"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <span>Galerie</span>
            </button>

            {/* Déclencheur Caméra */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                isRecording
                  ? 'border-red-600 bg-red-600/30'
                  : 'border-white bg-[#D35400] active:scale-95'
              }`}
            >
              {isRecording ? (
                <Square className="w-8 h-8 fill-white text-white" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#D35400]" />
              )}
            </button>

            <div className="w-12" />
          </>
        ) : (
          <>
            {/* Recommencer */}
            <button
              onClick={() => {
                setMode('RECORD');
                setPreviewUrl(null);
                setRecordedBlob(null);
              }}
              className="flex flex-col items-center gap-1 text-stone-300 text-xs hover:text-white"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span>Averina (Recommencer)</span>
            </button>

            {/* Valider la vidéo */}
            <button
              onClick={handleConfirm}
              className="flex flex-col items-center gap-1 text-[#D35400] text-xs font-bold"
            >
              <div className="w-14 h-14 rounded-full bg-[#D35400] text-white flex items-center justify-center shadow-lg shadow-orange-900/40">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <span>Hampiasa ity (Valider)</span>
            </button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleGalleryUpload}
      />
    </div>
  );
}
