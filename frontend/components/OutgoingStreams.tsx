"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface OutgoingStreamData {
  id: string;
  recipient: string;
  token: string;
  rate: string;
  remainingBalance: number;
  status: "Active" | "Completed" | "Paused";
}

const mockOutgoingStreams: OutgoingStreamData[] = [
  {
    id: "201",
    recipient: "G...7xYp",
    token: "USDC",
    rate: "1000/mo",
    remainingBalance: 2500.0,
    status: "Active",
  },
  {
    id: "202",
    recipient: "G...9KmN",
    token: "XLM",
    rate: "500/mo",
    remainingBalance: 1200.0,
    status: "Active",
  },
  {
    id: "203",
    recipient: "G...3LqR",
    token: "EURC",
    rate: "750/mo",
    remainingBalance: 0.0,
    status: "Completed",
  },
  {
    id: "204",
    recipient: "G...8ZtW",
    token: "USDC",
    rate: "2000/mo",
    remainingBalance: 5000.0,
    status: "Paused",
  },
  {
    id: "205",
    recipient: "G...5PqV",
    token: "XLM",
    rate: "300/mo",
    remainingBalance: 300.0,
    status: "Active",
  },
];

const OutgoingStreams: React.FC = () => {
  const [filter, setFilter] = useState<
    "All" | "Active" | "Completed" | "Paused"
  >("All");

  const filteredStreams =
    filter === "All"
      ? mockOutgoingStreams
      : mockOutgoingStreams.filter((s) => s.status === filter);

  const handleCancel = async (streamId: string) => {
    const toastId = toast.loading("Cancelling stream...");

    try {
      // Simulate async transaction (replace with real blockchain call later)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Stream cancelled successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to cancel stream:", error);
      toast.error("Failed to cancel stream.", { id: toastId });
    }
  };

  const handleModify = async (streamId: string) => {
    const toastId = toast.loading("Opening modify dialog...");

    try {
      // Simulate opening modify dialog (replace with real modal later)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Modify dialog opened!", { id: toastId });
    } catch (error) {
      console.error("Failed to open modify dialog:", error);
      toast.error("Failed to open modify dialog.", { id: toastId });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as "All" | "Active" | "Completed" | "Paused");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Outgoing Streams
        </h1>
        <div className="flex gap-4 items-center">
          <label
            htmlFor="statusFilter"
            className="text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            Filter Status:
          </label>
          <div className="relative">
            <select
              id="statusFilter"
              value={filter}
              onChange={handleFilterChange}
              className="bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-1.5 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Remaining Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStreams.map((stream) => (
              <tr
                key={stream.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {stream.recipient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {stream.token}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {stream.rate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold">
                  {stream.remainingBalance.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${
                                          stream.status === "Active"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                            : stream.status === "Completed"
                                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        }`}
                  >
                    {stream.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleModify(stream.id)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md transition-colors"
                    >
                      Modify
                    </button>
                    <button
                      onClick={() => handleCancel(stream.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStreams.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No {filter !== "All" ? filter.toLowerCase() : ""} streams found.
          </div>
        )}
      </div>
    </div>
  );
};

export default OutgoingStreams;
