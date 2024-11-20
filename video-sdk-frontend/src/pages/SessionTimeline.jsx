import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { svgs } from "./../utils/utils";
import LoaderWithMessage from "./../components/LoaderWithMessage";
import { useGetSessionByIdQuery } from "../store/apis/session";

const Tooltip = ({ message, children }) => {
  const tooltipRef = useRef(null);
  const [tooltipStyles, setTooltipStyles] = useState({});

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const { left, right } = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const styles = {};

      // Adjust tooltip position if it overflows on the left
      if (left < 0) {
        styles.left = `${Math.abs(left)}px`;
        styles.right = "auto";
      }

      // Adjust tooltip position if it overflows on the right
      if (right > viewportWidth) {
        styles.right = `${right - viewportWidth}px`;
        styles.left = "auto";
      }

      setTooltipStyles(styles);
    }
  }, []);

  return (
    <div className="relative group">
      {children}
      {/* Tooltip itself */}
      <div
        ref={tooltipRef}
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 px-3 py-1 text-sm font-medium text-white bg-gray-800 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          ...tooltipStyles,
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        {message}
      </div>
    </div>
  );
};

const icons = {
  timelog: { start: svgs.monitor, end: svgs.out },
  mic: { start: svgs.mic },
  webcam: { start: svgs.video },
  errors: { start: svgs.error },
  screenShare: { start: svgs.screenShare },
};

const EventOverlay = ({
  start,
  end,
  type,
  priority,
  errorMessage,
  sessionData,
}) => {
  const timelineStart = new Date(sessionData.start).getTime();
  const timelineEnd = new Date(sessionData.end).getTime();
  const eventStart = new Date(start).getTime();
  const eventEnd = end ? new Date(end).getTime() : eventStart;

  const startPercent =
    ((eventStart - timelineStart) / (timelineEnd - timelineStart)) * 100;
  const endPercent =
    ((eventEnd - timelineStart) / (timelineEnd - timelineStart)) * 100;

  // Define color and tooltip content based on event type
  const classes = {
    timelog: "bg-gray-400",
    mic: "bg-blue-500",
    webcam: "bg-blue-500",
    screenShare: "bg-blue-500",
    screenShareAudio: "bg-blue-500",
    errors: "bg-red-500",
  };

  const tooltipContent =
    type === "errors"
      ? errorMessage
      : `${type.charAt(0).toUpperCase() + type.slice(1)} ${
          end
            ? `started at ${new Date(start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })} and ended at ${new Date(end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}`
            : `at ${new Date(start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}`
        }`;

  return (
    <div
      className="absolute top-0 h-1"
      style={{
        left: `${startPercent}%`,
        width: `${end ? endPercent - startPercent : 1}%`,
        zIndex: priority,
      }}
    >
      {/* Bar */}
      {type !== "error" && (
        <div className={`${classes[type]} h-full rounded-md relative`} />
      )}

      {/* Start Icon */}
      <div
        className="absolute -left-3 top-1/2 -translate-y-1/2"
        style={{ zIndex: priority }}
      >
        <Tooltip message={tooltipContent}>
          <div
            className={`w-6 h-6 flex items-center justify-center rounded-lg ${classes[type]}`}
          >
            {icons[type]?.start}
          </div>
        </Tooltip>
      </div>

      {/* End Icon */}
      {type !== "error" && end && (
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2"
          style={{ zIndex: priority }}
        >
          <Tooltip message={tooltipContent}>
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-lg ${classes[type]}`}
            >
              {icons[type]?.end || icons[type]?.start}
            </div>
          </Tooltip>
        </div>
      )}

      {/* Error Icon */}
      {type === "error" && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2"
          style={{ zIndex: priority }}
        >
          <Tooltip message={`Error: ${errorMessage}`}>
            <div
              className={`flex items-center justify-center ${classes[type]}`}
            >
              {svgs.error}
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

// Function to Generate Time Divisions (24-hour format)
const generateTimeDivisions = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const totalMinutes = (endTime - startTime) / (1000 * 60); // Convert duration to minutes
  const interval = totalMinutes / 12; // Divide into 12 sections

  const timeMarkers = [];
  for (let i = 0; i <= 12; i++) {
    const marker = new Date(startTime.getTime() + i * interval * 60 * 1000);
    let hours = marker.getHours();
    const minutes = marker.getMinutes().toString().padStart(2, "0");

    // Push the time in 24-hour format
    timeMarkers.push(`${hours}:${minutes}`);
  }
  return timeMarkers;
};

// Function to Calculate Total Meeting Time for a Participant
const calculateTotalMinutes = (timelog) => {
  return timelog.reduce((total, log) => {
    const start = new Date(log.start).getTime();
    const end = new Date(log.end).getTime();
    return total + (end - start) / (1000 * 60); // Convert milliseconds to minutes
  }, 0);
};

export default function SessionTimeline() {
  const { sessionId } = useParams(); // Get sessionId from URL parameter

  // Fetch session data using the RTK Query hook
  const { data, error, isLoading, isError } = useGetSessionByIdQuery({
    sessionId,
  });

  if (isLoading) {
    return <LoaderWithMessage message="Loading session data..." />;
  }

  if (isError) {
    return (
      <div className="text-red-500">
        {error?.data.message ||
          "Failed to load session data. Please try again."}
      </div>
    );
  }

  const { start, end, uniqueParticipantsCount, participantArray } =
    data?.data || {};

  // Generate time divisions for the timeline
  const timeDivisions = generateTimeDivisions(start, end);

  return (
    <div className="bg-gray-900 text-white min-h-screen relative">
      {/* Meeting Info Bar */}
      <div
        className="flex justify-between items-center p-4 text-sm font-bold"
        style={{
          height: "49px",
          background: "#1F1F1F",
          border: "1px solid #393939",
        }}
      >
        <div
          className="flex justify-between items-center"
          style={{
            gap: "5px",
          }}
        >
          {svgs.clipboard}
          Participants wise Session Timeline
        </div>
        <div>Unique Participants : {uniqueParticipantsCount}</div>
      </div>

      {/* Time Divisions Bar */}
      <div
        className="flex justify-between items-center py-4 relative text-sm font-bold"
        style={{
          background: "#181818",
          color: "#666666",
          border: "1px solid #393939",
        }}
      >
        {timeDivisions.map((time, index) => (
          <div
            key={index}
            className="text-base font-semibold text-center flex-1"
          >
            {time}
          </div>
        ))}
      </div>

      {/* Participant Timeline */}
      <div
        className="relative"
        style={{ border: "1px solid #393939", background: "#181818" }}
      >
        {/* Background Timeline Bars */}
        <div className="absolute inset-0 flex">
          {timeDivisions.map((_, index) => (
            <div key={index} className="flex-1 flex justify-center">
              <div
                className="border-r border-gray-500 h-full "
                style={{ height: "100%", border: "1px solid #393939" }}
              ></div>
            </div>
          ))}
        </div>

        {/* Participant Details Overlay */}
        {participantArray.map((participant, index) => {
          const totalMinutes = calculateTotalMinutes(participant.timelog);
          return (
            <div
              key={participant.participantId}
              className={`w-full pb-3 border-b`}
              style={{
                background: "#181818",
                borderColor: "#393939",
              }}
            >
              <div
                className="relative p-4 ml-6 mt-3"
                style={{ width: "fit-content", background: "#181818" }}
              >
                {/* Participant Header */}
                <div className="pb-1 font-semibold text-base">
                  {participant.name} ({participant.participantId})
                </div>
                <div className="text-xs font-medium text-gray-300 flex items-center gap-2">
                  {new Date(participant.timelog[0]?.start).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                  ,
                  {new Date(participant.timelog[0]?.start).toLocaleTimeString(
                    "en-GB",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}{" "}
                  | Duration {Math.round(totalMinutes)} Mins
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="relative h-1 rounded-md mx-14 my-3">
                {/* Timelog Events */}
                {participant.timelog.map((log, logIndex) => (
                  <EventOverlay
                    key={`timelog-${logIndex}`}
                    start={log.start}
                    end={log.end}
                    type="timelog"
                    priority={1}
                    sessionData={{ start, end }}
                  />
                ))}
                {/* Mic/Webcam/ScreenShare Events */}
                {Object.keys(participant.events)?.map((event) =>
                  participant.events[event].map((eventData, index) => {
                    return (
                      <EventOverlay
                        key={`event-${index}`}
                        start={eventData.start}
                        end={eventData.end}
                        type={event}
                        errorMessage={eventData?.message}
                        priority={event === "errors" ? 3 : 2}
                        sessionData={{ start, end }}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
