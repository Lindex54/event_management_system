/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import jsQR from "jsqr";
import { CameraOff } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface QrScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the raw decoded QR text. Scanning pauses until this resolves. */
  onDetected: (data: string) => Promise<void> | void;
}

// Opens the device's back camera and continuously decodes QR frames on a hidden
// canvas. Detected codes are handed to the caller, which resolves the ticket and
// checks the attendee in — the scanner itself never talks to the API.
export function QrScannerDialog({ open, onOpenChange, onDetected }: QrScannerDialogProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const frameRef = React.useRef<number>(0);
  const pausedRef = React.useRef(false);
  const lastCodeRef = React.useRef<{ text: string; at: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        tick();
      } catch {
        if (!cancelled) setError("Camera access was denied or is unavailable on this device.");
      }
    }

    function tick() {
      frameRef.current = requestAnimationFrame(tick);
      const video = videoRef.current, canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA || pausedRef.current) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height);
      if (!code?.data) return;
      const now = Date.now();
      if (lastCodeRef.current?.text === code.data && now - lastCodeRef.current.at < 4000) return;
      lastCodeRef.current = { text: code.data, at: now };
      pausedRef.current = true;
      void Promise.resolve(onDetected(code.data)).finally(() => { pausedRef.current = false; });
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan ticket</DialogTitle>
          <DialogDescription>Point the camera at the attendee&apos;s QR code. Check-in happens automatically.</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/80">
              <CameraOff className="size-6" />
              <p>{error}</p>
            </div>
          ) : (
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
