// Static Data for Testing
const timelineData = {
  participants: [
    {
      name: "Arjun Kava (ABC001)",
      events: [
        { type: "mic", start: "11:10", end: "11:30" },
        { type: "webcam", start: "11:15", end: "11:50" },
        { type: "error", start: "11:40", message: "Mic disconnected" },
      ],
    },
    {
      name: "Nikhil Chavda (ABC002)",
      events: [
        { type: "mic", start: "11:05", end: "11:25" },
        { type: "error", start: "11:20", message: "Connection lost" },
        { type: "webcam", start: "11:30", end: "11:45" },
      ],
    },
    {
      name: "Ahmed Bhesaniya (ABC003)",
      events: [
        { type: "mic", start: "11:00", end: "11:20" },
        { type: "webcam", start: "11:10", end: "11:50" },
      ],
    },
  ],
};

export default function SessionTimeline() {
  const { start, end, participants } = timelineData;

  // Convert start/end times to minutes
  const totalMinutes = calculateDurationInMinutes(start, end);

  return (
    <div className="bg-gray-900 text-white p-4">
      {/* Timeline Header */}
      <div className="grid grid-cols-4 gap-4 items-center text-sm font-bold mb-4">
        <div className="col-span-1">Participants</div>
        <div className="col-span-3 flex justify-between text-xs">
          {generateTimeMarkers(start, end).map((time, index) => (
            <span key={index}>{time}</span>
          ))}
        </div>
      </div>

      {/* Timeline Rows */}
      {participants.map((participant, index) => (
        <ParticipantRow
          key={index}
          participant={participant}
          totalMinutes={totalMinutes}
          timelineStart={start}
        />
      ))}
    </div>
  );
}

const ParticipantRow = ({ participant, totalMinutes, timelineStart }) => {
  return (
    <div className="grid grid-cols-4 gap-4 items-center text-sm mb-4">
      {/* Participant Name */}
      <div className="col-span-1">{participant.name}</div>

      {/* Timeline */}
      <div className="col-span-3 relative flex items-center">
        <div className="w-full h-1 bg-gray-700 relative">
          {/* Render Events */}
          {participant.events.map((event, index) => (
            <EventBar
              key={index}
              event={event}
              totalMinutes={totalMinutes}
              timelineStart={timelineStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const EventBar = ({ event, totalMinutes, timelineStart }) => {
  const { type, start, end, message } = event;

  const startMinutes = calculateMinutesFromStart(timelineStart, start);
  const endMinutes = end
    ? calculateMinutesFromStart(timelineStart, end)
    : startMinutes;

  const leftPercent = (startMinutes / totalMinutes) * 100;
  const widthPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;

  const eventColors = {
    mic: "bg-blue-500",
    webcam: "bg-green-500",
    error: "bg-red-500",
  };

  return (
    <div
      className={`absolute h-1 ${eventColors[type] || "bg-gray-500"} rounded`}
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      title={message || ""}
    ></div>
  );
};

const generateTimeMarkers = (start, end) => {
  const startHour = new Date(start).getHours();
  const endHour = new Date(end).getHours();
  const markers = [];

  for (let i = startHour; i <= endHour; i++) {
    markers.push(`${i}:00`);
    markers.push(`${i}:30`);
  }

  return markers;
};

const calculateMinutesFromStart = (timelineStart, time) => {
  const startDate = new Date(timelineStart);
  const eventDate = new Date(`2024-04-02T${time}:00.000Z`);
  return (eventDate - startDate) / (1000 * 60);
};

const calculateDurationInMinutes = (start, end) => {
  return (new Date(end) - new Date(start)) / (1000 * 60);
};
