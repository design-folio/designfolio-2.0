import { useState, useEffect, startTransition } from "react";
import { Video, Mic, CheckCircle2, XCircle, Clapperboard, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyLogo } from "./CompanyLogo";

function PermissionCard({ icon: Icon, label, description, state, onRequest }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-black/[0.07] bg-black/[0.02] p-4 dark:border-white/[0.07] dark:bg-white/[0.02]">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] dark:bg-white/[0.05]">
        <Icon className="text-foreground/60 h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-foreground mb-0.5 text-[14px] font-semibold">{label}</div>
        <div className="text-foreground/50 text-[13px] leading-[1.5] break-words">
          {description}
        </div>
      </div>
      <div className="mt-0.5 shrink-0">
        {state === "granted" ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Allowed
          </div>
        ) : state === "denied" ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-red-500">
            <XCircle className="h-4 w-4" />
            Denied
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="text-foreground/70 hover:text-foreground h-8 rounded-full border border-black/10 px-3.5 text-[13px] font-medium transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:hover:bg-white/[0.04]"
          >
            Request
          </button>
        )}
      </div>
    </div>
  );
}

export function MockInterviewDialog({ job, open, onClose, onStart }) {
  const [camPerm, setCamPerm] = useState("idle");
  const [micPerm, setMicPerm] = useState("idle");

  const requestPerm = async (kind) => {
    try {
      const constraints = kind === "camera" ? { video: true } : { audio: true };
      await navigator.mediaDevices.getUserMedia(constraints);
      kind === "camera" ? setCamPerm("granted") : setMicPerm("granted");
    } catch {
      kind === "camera" ? setCamPerm("denied") : setMicPerm("denied");
    }
  };

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setCamPerm("idle");
        setMicPerm("idle");
      });
    }
  }, [open]);

  if (!job) return null;
  const bothGranted = camPerm === "granted" && micPerm === "granted";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        overlayClassName="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        className="z-[301] max-w-[440px] gap-0 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-0 dark:border-white/[0.08] dark:bg-[#2A2520]"
      >
        <DialogHeader className="min-w-0 overflow-hidden border-b border-black/[0.06] px-6 pt-6 pb-5 dark:border-white/[0.06]">
          <div className="flex w-full items-center gap-3 overflow-hidden">
            <CompanyLogo logoUrl={job.logoUrl} company={job.company} size={40} />
            <div className="min-w-0 flex-1 overflow-hidden">
              <DialogTitle className="m-0 truncate text-[17px] leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
                Ready to practise?
              </DialogTitle>
              <p className="text-foreground/50 mt-0.5 truncate text-[13px]">
                {job.role} · {job.company}
              </p>
            </div>
          </div>
          <p className="text-foreground/50 mt-4 text-[14px] leading-[1.6] break-words">
            Grant camera and microphone access below so your mock interview session can run
            smoothly.
          </p>
        </DialogHeader>

        <div className="space-y-3 px-6 py-5">
          <p className="text-foreground/40 mb-4 text-[12px] font-semibold tracking-widest uppercase">
            Permissions required
          </p>
          <PermissionCard
            icon={Video}
            label="Camera"
            description="Used to record your expressions and body language during the interview."
            state={camPerm}
            onRequest={() => requestPerm("camera")}
          />
          <PermissionCard
            icon={Mic}
            label="Microphone"
            description="Used to capture your answers and generate real-time interview feedback."
            state={micPerm}
            onRequest={() => requestPerm("mic")}
          />
        </div>

        <div className="px-6 pb-6">
          <button
            disabled={!bothGranted}
            onClick={() => {
              onClose();
              onStart();
            }}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1A1A1A] text-[14px] font-medium text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-black"
          >
            <Clapperboard className="h-4 w-4" />
            Start mock interview
          </button>
          {!bothGranted && (
            <p className="text-foreground/35 mt-2.5 text-center text-[12px]">
              Allow both permissions to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
