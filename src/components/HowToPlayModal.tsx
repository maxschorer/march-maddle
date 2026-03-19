import Modal from './Modal';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} title="How to Play" onClose={onClose}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto p-4 bg-white rounded-lg">
        <div className="space-y-4">
          <p className="font-medium">Guess today's March Madness team in 8 tries!</p>
          
          <p>Each team has five attributes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Seed</strong> — Tournament seed (1-16)</li>
            <li><strong>Region</strong> — East, West, South, or Midwest</li>
            <li><strong>Conference</strong> — The team's conference (ACC, SEC, Big Ten, etc.)</li>
            <li><strong>State</strong> — Where the school is located</li>
            <li><strong>KenPom</strong> — KenPom ranking (1 = best)</li>
          </ul>
          
          <p>The color of each tile shows how close your guess is:</p>
          
          <div className="space-y-2">
            <p><span className="inline-block w-4 h-4 bg-green-500 rounded mr-2 align-middle"></span><strong>Green</strong> — Exact match!</p>
            <p><span className="inline-block w-4 h-4 bg-yellow-500 rounded mr-2 align-middle"></span><strong>Yellow</strong> — Close:</p>
            <ul className="list-disc pl-10 text-sm space-y-1">
              <li>Seed within 2 of the target</li>
              <li>Conference in the same tier (e.g., both power conferences)</li>
              <li>KenPom ranking within 10</li>
            </ul>
            <p><span className="inline-block w-4 h-4 bg-gray-400 rounded mr-2 align-middle"></span><strong>Gray</strong> — Not close</p>
          </div>

          <p>For <strong>Seed</strong> and <strong>KenPom</strong>, arrows show if the target is higher ↑ or lower ↓.</p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Tips</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>Start with a well-known team to narrow down the region and conference</li>
            <li>Use the arrows on Seed and KenPom to zero in</li>
            <li>If the state is green but the team is wrong, think about other schools in that state</li>
            <li>There are 68 teams in the pool — all NCAA tournament teams</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">Season Tracking</h2>
          <p className="text-sm text-gray-700">
            Sign in with Google to play past games you missed, track your win streak, and see your season stats. 
            A new team drops every day from March 17 through April 6.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default HowToPlayModal;
