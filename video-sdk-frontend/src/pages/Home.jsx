import { useState } from "react";
import { useGetSessionQuery } from "../store/apis/session";
import LoaderWithMessage from "./../components/LoaderWithMessage";
import { useNavigate } from "react-router-dom";

const getSessionStatus = (start, end) => {
  const now = new Date();
  const sessionStart = new Date(start);

  if (!end) {
    return "In Progress";
  }

  const sessionEnd = new Date(end);

  if (now < sessionStart) {
    return "Upcoming";
  } else if (now > sessionEnd) {
    return "Over";
  } else {
    return "In Progress";
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Fetch sessions with pagination parameters
  const { data, isLoading, isFetching } = useGetSessionQuery({ page, perPage });

  const sessions = data?.data?.sessions || [];
  const totalSessions = data?.data?.pagination?.total || 0;
  const totalPages = data?.data?.pagination?.totalPages || 1;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Page Header */}
      <div className="px-8 py-6 bg-gray-800 border-b border-gray-700">
        <h1 className="text-3xl font-semibold">Sessions Summary</h1>
        <p className="text-gray-400 mt-2">
          Explore all sessions conducted so far, along with their details and
          participants.
        </p>
      </div>

      {/* Table Container */}
      <div className="flex-grow px-8 py-6">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-700 text-gray-300">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left border border-gray-700">
                  #
                </th>
                <th className="py-3 px-4 text-left border border-gray-700">
                  Status
                </th>
                <th className="py-3 px-4 text-left border border-gray-700">
                  Participants Count
                </th>
                <th className="py-3 px-4 text-left border border-gray-700">
                  Participants
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching || isLoading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-center border border-gray-700"
                  >
                    <LoaderWithMessage message={"Fetching sessions..."} />
                  </td>
                </tr>
              ) : sessions.length > 0 ? (
                sessions.map((session, index) => {
                  const status = getSessionStatus(session.start, session.end);
                  const participants = session.participantsData
                    .map((p) => p.name)
                    .join(", ");

                  return (
                    <tr
                      key={session._id}
                      className="hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => {
                        if (status === "Over") {
                          navigate(`/${session.meetingId}`);
                        }
                      }}
                    >
                      <td className="py-3 px-4 border border-gray-700">
                        {(page - 1) * perPage + index + 1}
                      </td>
                      <td className="py-3 px-4 border border-gray-700">
                        {status}
                      </td>
                      <td className="py-3 px-4 border border-gray-700">
                        {session.uniqueParticipantsCount}
                      </td>
                      <td className="py-3 px-4 border border-gray-700">
                        {participants}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-6 text-center border border-gray-700"
                  >
                    No sessions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="px-8 py-4 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
        <span className="text-gray-400">
          Showing {(page - 1) * perPage + 1} to{" "}
          {Math.min(page * perPage, totalSessions)} of {totalSessions} entries
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded ${
              page === totalPages
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
