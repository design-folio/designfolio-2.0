import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { MockInterviewRoom } from "./MockInterviewRoom";
import { InterviewReport } from "./InterviewReport";
import { ScoutChat } from "./ScoutChat";
import { OfferDecisionScout } from "./OfferDecisionScout";

export function PortalOverlays({
  roomJob,
  profileId,
  onRoomEnd,
  reportJob,
  completedReports,
  reportLoading,
  onReportClose,
  viewingReport,
  onViewingReportClose,
  scoutJob,
  onScoutClose,
  offerDecisionOpen,
  offerJobs,
  onOfferClose,
  onCreditUsed,
}) {
  return createPortal(
    <AnimatePresence>
      {roomJob && (
        <MockInterviewRoom
          key={roomJob.id}
          job={roomJob}
          profileId={profileId}
          onEnd={onRoomEnd}
        />
      )}
      {reportJob && (
        <InterviewReport
          key={`report-${reportJob.id}`}
          job={reportJob}
          report={completedReports[reportJob.id]?.at(-1)?.report ?? null}
          loading={reportLoading}
          onClose={onReportClose}
        />
      )}
      {viewingReport && (
        <InterviewReport
          key={`viewing-${viewingReport.job.id}-${viewingReport.entry.date}`}
          job={viewingReport.job}
          report={viewingReport.entry.report}
          onClose={onViewingReportClose}
        />
      )}
      {scoutJob && (
        <ScoutChat
          key={scoutJob.id}
          job={scoutJob}
          profileId={profileId}
          onClose={onScoutClose}
        />
      )}
      {offerDecisionOpen && offerJobs.length >= 2 && (
        <OfferDecisionScout
          key="offer-decision"
          jobs={offerJobs.slice(0, 2)}
          profileId={profileId}
          onClose={onOfferClose}
          onCreditUsed={onCreditUsed}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
