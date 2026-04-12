import { useState, useEffect } from "react";
import { Video, Mic, CheckCircle2, XCircle, Clapperboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanyLogo } from "./CompanyLogo";

function PermissionCard({ icon: Icon, label, description, state, onRequest }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02]">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center mt-0.5">
        <Icon className="w-4 h-4 text-foreground/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-foreground mb-0.5">{label}</div>
        <div className="text-[13px] text-foreground/50 leading-[1.5]">{description}</div>
      </div>
      <div className="flex-shrink-0 mt-0.5">
        {state === "granted" ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Allowed
          </div>
        ) : state === "denied" ? (
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-red-500">
            <XCircle className="w-4 h-4" />
            Denied
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="h-8 px-3.5 rounded-full border border-black/10 dark:border-white/10 text-[13px] font-medium text-foreground/70 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
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
      setCamPerm("idle");
      setMicPerm("idle");
    }
  }, [open]);

  if (!job) return null;
  const bothGranted = camPerm === "granted" && micPerm === "granted";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-white dark:bg-[#2A2520] border border-black/[0.08] dark:border-white/[0.08] p-0 gap-0 max-w-[440px] rounded-2xl overflow-hidden"
      >
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <CompanyLogo logoUrl={job.logoUrl} company={job.company} size={40} />
            <div className="min-w-0">
              <DialogTitle className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[17px] font-semibold leading-tight m-0 truncate">
                Ready to practise?
              </DialogTitle>
              <p className="text-[13px] text-foreground/50 mt-0.5 truncate">
                {job.role} · {job.company}
              </p>
            </div>
          </div>
          <p className="text-[14px] text-foreground/50 leading-[1.6] mt-4">
            Grant camera and microphone access below so your mock interview session can run smoothly.
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-3">
          <p className="text-[12px] font-semibold text-foreground/40 uppercase tracking-widest mb-4">
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
            className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[14px] font-medium transition-opacity disabled:opacity-30"
          >
            <Clapperboard className="w-4 h-4" />
            Start mock interview
          </button>
          {!bothGranted && (
            <p className="text-center text-[12px] text-foreground/35 mt-2.5">
              Allow both permissions to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
