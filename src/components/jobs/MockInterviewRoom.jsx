import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Mic, MicOff, Phone, ChevronLeft } from "lucide-react";
import { _postJobsInterviewSession, _deleteJobsInterviewSession } from "@/network/jobs";

// Guard against missing package: import lazily
let createClient = null;
let AnamEvent = null;
try {
  const anamSdk = require("@anam-ai/js-sdk");
  createClient = anamSdk.createClient;
  AnamEvent = anamSdk.AnamEvent;
} catch {
  // package not installed
}

function formatTime(ms) {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSecs / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MockInterviewRoom({ job, profileId, onEnd }) {
  const userVideoRef = useRef(null);
  const transcriptRef = useRef(null);
  const anamClientRef = useRef(null);
  const userStreamRef = useRef(null);
  const timerRef = useRef(null);
  const maxDurationMsRef = useRef(3 * 60 * 1000); // fallback 3 min (Anam plan limit)

  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("connecting"); // connecting | ready | error | busy
  const [transcript, setTranscript] = useState([]);
  const [timeLeftMs, setTimeLeftMs] = useState(null);

  const cleanup = useCallback(
    async (currentTranscript) => {
      clearInterval(timerRef.current);
      anamClientRef.current?.stopStreaming();
      userStreamRef.current?.getTracks().forEach((t) => t.stop());
      await _deleteJobsInterviewSession();
      onEnd(currentTranscript);
    },
    [onEnd]
  );

  useEffect(() => {
    let mounted = true;
    let localTranscript = [];

    const start = async () => {
      try {
        if (!createClient || !AnamEvent) {
          console.error("[MockInterview] @anam-ai/js-sdk is not installed");
          if (mounted) setStatus("error");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userStreamRef.current = stream;
        if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        if (!mounted) return;

        const tokenRes = await _postJobsInterviewSession(job.id, profileId);
        const { sessionToken, maxDurationMs } = tokenRes.data;
        if (!mounted) return;

        const duration = maxDurationMs ?? maxDurationMsRef.current;
        maxDurationMsRef.current = duration;

        // Start countdown
        const deadline = Date.now() + duration;
        setTimeLeftMs(duration);
        timerRef.current = setInterval(() => {
          const left = deadline - Date.now();
          setTimeLeftMs(left);
          if (left <= 0) {
            clearInterval(timerRef.current);
            // Auto-end: pass accumulated transcript
            cleanup(localTranscript);
          }
        }, 1000);

        const client = createClient(sessionToken);
        anamClientRef.current = client;

        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (messages) => {
          localTranscript = [...messages];
          if (mounted) setTranscript(localTranscript);
        });

        client.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
          if (mounted) setStatus("ready");
        });

        client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          if (mounted) setStatus("error");
        });

        await client.streamToVideoElement("anam-avatar-video", stream);
      } catch (err) {
        console.error("[MockInterview] start error:", err);
        if (!mounted) return;
        const code = err?.response?.status;
        setStatus(code === 503 ? "busy" : "error");
        // Release camera if we never got a session
        userStreamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };

    start();
    return () => {
      mounted = false;
      clearInterval(timerRef.current);
      anamClientRef.current?.stopStreaming();
      userStreamRef.current?.getTracks().forEach((t) => t.stop());
      _deleteJobsInterviewSession();
    };
  }, [job.id, profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnd = useCallback(() => {
    cleanup(transcript);
  }, [cleanup, transcript]);

  const toggleMute = () => {
    if (muted) {
      anamClientRef.current?.unmuteInputAudio();
    } else {
      anamClientRef.current?.muteInputAudio();
    }
    setMuted((m) => !m);
  };

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const isWarning = timeLeftMs !== null && timeLeftMs <= 30 * 1000;

  return (
    <motion.div
      className="fixed inset-0 z-[400] flex flex-col bg-[#111111]"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Video panels */}
      <div className="flex min-h-0 flex-1 gap-3 p-4">
        {/* AI avatar — anam streams into this video element */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#1C1C1E]">
          {status === "connecting" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white/50" />
              <p className="mt-3 text-[13px] text-white/35">Connecting to Kevin…</p>
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[13px] text-red-400/80">Connection failed. Please try again.</p>
              <button onClick={() => onEnd([])} className="text-[12px] text-white/40 underline">
                Go back
              </button>
            </div>
          )}
          {status === "busy" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[13px] text-amber-400/80">
                Another interview is in progress. Please try again in a few minutes.
              </p>
              <button onClick={() => onEnd([])} className="text-[12px] text-white/40 underline">
                Go back
              </button>
            </div>
          )}
          <video
            id="anam-avatar-video"
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 text-[13px] font-medium text-white/70">
            Kevin · AI Interviewer
          </div>

          {/* Timer */}
          {timeLeftMs !== null && status === "ready" && (
            <div
              className={`absolute top-3 right-3 rounded-md px-2 py-1 font-mono text-[12px] font-medium ${
                isWarning ? "bg-red-500/20 text-red-400" : "bg-black/30 text-white/50"
              }`}
            >
              {formatTime(timeLeftMs)}
            </div>
          )}
        </div>

        {/* User camera */}
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#1C1C1E]">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 text-[13px] font-medium text-white/70">You</div>
          {muted && (
            <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/90">
              <MicOff className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div
        ref={transcriptRef}
        className="scrollbar-hide h-[160px] space-y-2.5 overflow-y-auto border-t border-white/[0.06] px-4 py-3"
      >
        {transcript.length === 0 && (
          <p className="pt-6 text-center text-[13px] text-white/25">Transcript will appear here…</p>
        )}
        {transcript.map((msg) => {
          const isPersona = msg.role === "persona";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${!isPersona ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  isPersona ? "bg-indigo-600" : "bg-white/20"
                }`}
              >
                {isPersona ? "K" : "Y"}
              </div>
              <p
                className={`max-w-[70%] text-[13px] leading-[1.55] ${
                  isPersona ? "text-white/80" : "text-white/60"
                }`}
              >
                {msg.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom navbar */}
      <div className="flex h-[56px] shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#1C1C1E] px-4">
        <button
          onClick={handleEnd}
          className="flex items-center gap-1.5 text-white/50 transition-colors hover:text-white/80"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[14px]">Interview Room</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white select-none">
            MB
          </div>
          <button
            onClick={toggleMute}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              muted ? "bg-red-500/20 text-red-400" : "text-white/50 hover:text-white/80"
            }`}
          >
            {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <button
            onClick={handleEnd}
            className="flex h-8 items-center gap-1.5 rounded-full bg-red-500 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600"
          >
            <Phone className="h-3.5 w-3.5" />
            End
          </button>
        </div>
      </div>
    </motion.div>
  );
}
