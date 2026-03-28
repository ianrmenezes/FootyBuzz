import { Link } from "react-router-dom";
import TeamCrest from "../ui/TeamCrest";
import StatusBadge from "../ui/StatusBadge";
import FavoriteButton from "../ui/FavoriteButton";
import { formatTime, isLive, getScoreDisplay } from "../../utils/helpers";
import { MATCH_STATUS } from "../../utils/constants";

export default function MatchCard({ match, showCompetition = false }) {
  const { homeTeam, awayTeam, score, status, utcDate } = match;
  const live = isLive(status);
  const finished = status === MATCH_STATUS.FINISHED;
  const scoreText = getScoreDisplay(match);
  const hasScore = finished || live;

  const homeName = homeTeam?.shortName || homeTeam?.name || "TBD";
  const awayName = awayTeam?.shortName || awayTeam?.name || "TBD";

  return (
    <div
      className={`card-hover p-4 group ${
        live ? "border-red-200 bg-red-50/30" : ""
      }`}
    >
      {/* Top bar: competition + time */}
      <div className="flex items-center justify-between mb-3">
        {showCompetition && match.competition ? (
          <Link
            to={`/standings?league=${match.competition.code || ""}`}
            className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 truncate transition-colors uppercase tracking-wide"
          >
            {match.competition.emblem && (
              <img
                src={match.competition.emblem}
                alt=""
                className="inline w-3.5 h-3.5 mr-1 -mt-0.5"
              />
            )}
            {match.competition.name}
          </Link>
        ) : (
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
            Matchday {match.matchday}
          </span>
        )}
        <StatusBadge status={status} />
      </div>

      {/* Teams & Score */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {homeTeam?.id && (
            <FavoriteButton
              team={{ id: homeTeam.id, name: homeTeam.name, crest: homeTeam.crest }}
            />
          )}
          <TeamCrest src={homeTeam?.crest} name={homeName} size={28} />
          <span
            className={`text-[13px] font-semibold truncate ${
              hasScore && score?.winner === "HOME_TEAM"
                ? "text-gray-900"
                : "text-gray-600"
            }`}
          >
            {homeName}
          </span>
        </div>

        {/* Score */}
        <div
          className={`shrink-0 min-w-[64px] text-center px-3 py-1.5 rounded-xl ${
            live
              ? "bg-red-50 text-red-600 border border-red-200"
              : hasScore
              ? "bg-gray-100 text-gray-900 border border-gray-200"
              : "bg-gray-50 text-gray-400 border border-gray-100"
          }`}
        >
          {hasScore ? (
            <span className="text-lg font-bold tabular-nums">{scoreText}</span>
          ) : (
            <span className="text-[13px] font-medium">{formatTime(utcDate)}</span>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
          <span
            className={`text-[13px] font-semibold truncate text-right ${
              hasScore && score?.winner === "AWAY_TEAM"
                ? "text-gray-900"
                : "text-gray-600"
            }`}
          >
            {awayName}
          </span>
          <TeamCrest src={awayTeam?.crest} name={awayName} size={28} />
          {awayTeam?.id && (
            <FavoriteButton
              team={{ id: awayTeam.id, name: awayTeam.name, crest: awayTeam.crest }}
            />
          )}
        </div>
      </div>

      {/* Half time score for finished */}
      {finished && score?.halfTime?.home != null && (
        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
          HT: {score.halfTime.home} – {score.halfTime.away}
        </p>
      )}

      {/* Live indicator pulse */}
      {live && (
        <div className="flex justify-center mt-2">
          <span className="text-[11px] text-red-500 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
            {match.minute ? `${match.minute}'` : "In Progress"}
          </span>
        </div>
      )}
    </div>
  );
}
