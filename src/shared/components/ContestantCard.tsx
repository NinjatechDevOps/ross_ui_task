"use client";

interface Contestant {
  id: number;
  name: string;
  type?: string;
  image?: string;
  votes?: number;
}

interface ContestantCardProps {
  contestant: Contestant;
  children?: React.ReactNode;
}

export const ContestantCard = ({ contestant, children }: ContestantCardProps) => {
  return (
    <div className="bg-white/90 rounded-3xl shadow-2xl flex flex-col h-full transition-transform hover:-translate-y-2 hover:shadow-fuchsia-400/60 border-2 border-transparent hover:border-fuchsia-400">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-fuchsia-200 to-purple-100 flex items-center justify-center mb-4 overflow-hidden shadow-lg">
          {contestant.image ? (
            <img
              src={contestant.image}
              alt={contestant.name}
              width={112}
              height={112}
              className="object-cover rounded-full w-full h-full"
            />
          ) : (
            <span className="text-5xl text-purple-300">?</span>
          )}
        </div>
        <div className="font-extrabold text-2xl mb-1 text-center text-purple-900 drop-shadow">
          {contestant.name}
        </div>
        {contestant.type && (
          <div className="text-fuchsia-700 text-lg mb-3 text-center font-semibold">
            {contestant.type}
          </div>
        )}
      </div>
      {children && (
        <div className="border-t px-6 py-5 flex flex-col items-center">
          {children}
        </div>
      )}
    </div>
  );
};