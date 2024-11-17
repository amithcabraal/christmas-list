import React, { useEffect, useState } from 'react';
import { Gift, ArrowLeft, ArrowRight } from 'lucide-react';
import { Assignment, Participant } from './types';
import { assignGifts, getParticipantColor } from './utils';
import { AssignmentTable } from './components/AssignmentTable';
import { ErrorBoundary } from './components/ErrorBoundary';

const PARTICIPANTS: Participant[] = [
  // Family 1 - Generation 2
  { name: 'Amith', family: 1, generation: 2, color: '' },
  { name: 'Tajinder', family: 1, generation: 2, color: '' },
  // Family 1 - Generation 1
  { name: 'Suresh', family: 1, generation: 1, color: '' },
  { name: 'Jasmine', family: 1, generation: 1, color: '' },
  // Family 2 - Generation 2
  { name: 'Sanath', family: 2, generation: 2, color: '' },
  // Family 2 - Generation 1
  { name: 'Isobel', family: 2, generation: 1, color: '' },
  { name: 'James', family: 2, generation: 1, color: '' },
  // Family 3 - Generation 2
  { name: 'Shiromi', family: 3, generation: 2, color: '' },
  { name: 'Kevin', family: 3, generation: 2, color: '' },
  // Family 3 - Generation 1
  { name: 'Rohan', family: 3, generation: 1, color: '' },
  { name: 'Naresh', family: 3, generation: 1, color: '' },
  { name: 'Elisha', family: 3, generation: 1, color: '' },
  // Family 4 - Generation 3
  { name: 'Grandma', family: 4, generation: 3, color: '' },
];

function App() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentSeed, setCurrentSeed] = useState<number>(0);
  const [seedHistory, setSeedHistory] = useState<number[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const initialSeed = hash ? parseInt(hash, 10) : Math.floor(Math.random() * 1000000);
    generateAssignments(initialSeed);
  }, []);

  const generateAssignments = (seed: number, addToHistory = true) => {
    setLoading(true);
    setError('');
    
    try {
      const result = assignGifts(PARTICIPANTS, seed);
      setAssignments(result.assignments);
      setCurrentSeed(seed);
      
      if (addToHistory) {
        setSeedHistory(prev => [...prev.slice(0, historyIndex + 1), seed]);
        setHistoryIndex(prev => prev + 1);
      }
      
      window.location.hash = `#${seed}`;
    } catch (err) {
      console.error('Assignment error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAssignments = () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    generateAssignments(newSeed);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevSeed = seedHistory[historyIndex - 1];
      setHistoryIndex(prev => prev - 1);
      generateAssignments(prevSeed, false);
    }
  };

  const handleForward = () => {
    if (historyIndex < seedHistory.length - 1) {
      const nextSeed = seedHistory[historyIndex + 1];
      setHistoryIndex(prev => prev + 1);
      generateAssignments(nextSeed, false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="w-12 h-12 text-red-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Generating assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-green-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-12 h-12 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-800">
                Secret Santa Assignment
              </h1>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={handleBack}
                disabled={historyIndex <= 0}
                className="p-2 rounded-full hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous seed"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="bg-white/80 rounded-lg px-4 py-2">
                <span className="font-mono">Seed: {currentSeed}</span>
              </div>
              
              <button
                onClick={handleForward}
                disabled={historyIndex >= seedHistory.length - 1}
                className="p-2 rounded-full hover:bg-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next seed"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleNewAssignments}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-full transition-colors duration-200 shadow-md"
              disabled={loading}
            >
              Generate New Assignments
            </button>
            
            {error && (
              <p className="text-red-600 mt-4 font-semibold bg-red-50 p-4 rounded-lg">
                {error}
              </p>
            )}
          </div>

          {assignments.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/80 p-4 rounded-lg shadow-lg">
                  <AssignmentTable
                    title="Who Gives Gifts To Whom"
                    assignments={assignments}
                    participants={PARTICIPANTS}
                    showGivers={true}
                  />
                </div>
                <div className="bg-white/80 p-4 rounded-lg shadow-lg">
                  <AssignmentTable
                    title="Who Receives Gifts From Whom"
                    assignments={assignments}
                    participants={PARTICIPANTS}
                    showGivers={false}
                  />
                </div>
              </div>

              <div className="bg-white/80 rounded-lg p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Family & Generation Groups</h2>
                <div className="space-y-6">
                  {[3, 2, 1].map((gen) => (
                    <div key={gen} className="space-y-3">
                      <h3 className="text-xl font-semibold text-gray-700">
                        {gen === 3
                          ? 'Generation 3 (Grandparent)'
                          : gen === 2
                          ? 'Generation 2 (Parent)'
                          : 'Generation 1 (Child)'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((familyNum) => {
                          const familyMembers = PARTICIPANTS.filter(
                            (p) => p.family === familyNum && p.generation === gen
                          );
                          if (familyMembers.length === 0) return null;
                          return (
                            <div key={`${gen}-${familyNum}`} className="bg-white p-3 rounded-lg">
                              <h4 className="font-semibold text-gray-600 mb-2">
                                Family {familyNum}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {familyMembers.map((p) => {
                                  const colors = getParticipantColor(p);
                                  return (
                                    <span
                                      key={p.name}
                                      className="px-3 py-1 rounded-full text-sm"
                                      style={{
                                        backgroundColor: colors.bg,
                                        color: colors.text
                                      }}
                                    >
                                      {p.name}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;