import React from 'react';
import { Assignment, Participant } from '../types';
import { getParticipantColor } from '../utils';

interface AssignmentTableProps {
  title: string;
  assignments: Assignment[];
  participants: Participant[];
  showGivers?: boolean;
}

export function AssignmentTable({
  title,
  assignments,
  participants,
  showGivers = true,
}: AssignmentTableProps) {
  const getParticipantStyles = (name: string) => {
    const participant = participants.find((p) => p.name === name);
    if (!participant) return { backgroundColor: '#ffffff', color: '#000000' };
    const colors = getParticipantColor(participant);
    return {
      backgroundColor: colors.bg,
      color: colors.text
    };
  };

  const groupedAssignments = assignments.reduce((acc, curr) => {
    const key = showGivers ? curr.giver : curr.receiver;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(showGivers ? curr.receiver : curr.giver);
    return acc;
  }, {} as Record<string, string[]>);

  // Sort entries by the first column (person name)
  const sortedEntries = Object.entries(groupedAssignments).sort(([a], [b]) => 
    a.localeCompare(b)
  );

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                {showGivers ? 'Giver' : 'Receiver'}
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                {showGivers ? 'Receivers' : 'Givers'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedEntries.map(([person, others]) => (
              <tr key={person} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <span
                    className="px-2 py-1 rounded-full text-sm"
                    style={getParticipantStyles(person)}
                  >
                    {person}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {others.map((other) => (
                      <span
                        key={other}
                        className="px-2 py-1 rounded-full text-sm"
                        style={getParticipantStyles(other)}
                      >
                        {other}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}