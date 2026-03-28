import { isLive, getMatchStatusLabel } from "../../utils/helpers";
import { MATCH_STATUS } from "../../utils/constants";

export default function StatusBadge({ status }) {
  const label = getMatchStatusLabel(status);

  if (isLive(status)) {
    return (
      <span className="badge-live">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        {label}
      </span>
    );
  }

  if (status === MATCH_STATUS.FINISHED) {
    return <span className="badge-finished">{label}</span>;
  }

  return <span className="badge-scheduled">{label}</span>;
}
