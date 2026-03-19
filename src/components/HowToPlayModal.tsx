import { useGrid } from '../contexts/GridContext';
import Modal from './Modal';
import { Link } from 'react-router-dom';

const HowToPlayModal = () => {
  const { showHowToPlay, setShowHowToPlay } = useGrid();

  if (!showHowToPlay) return null;

  return (
    <Modal isOpen={showHowToPlay} title={"How to Play"} onClose={() => setShowHowToPlay(false)}>
      <div className="space-y-8 max-h-[80vh] overflow-y-auto p-4 bg-white rounded-lg">
        {/* How to Play Section */}
        <div>
          <div className="space-y-4">
            <p>Guess today's NBA player in 8 tries!</p>
            
            <p>The player will either be one of the top 100 players on NBA 2K or an NBA legend.</p>
            
            <p>Each player has five attributes:</p>
            <ul className="list-disc pl-5">
              <li>Position</li>
              <li>Country of Origin</li>
              <li>Team</li>
              <li>Seasons</li>
              <li>Rating</li>
            </ul>
            
            <p>The color of the tile shows how close each attribute is to the day's player.</p>
            
            <div className="space-y-2">
              <p><span className="font-bold text-green-600">Green</span> means the attributes match.</p>
              <p><span className="font-bold text-yellow-600">Yellow</span> means the attribute is close.</p>
              <ul className="list-disc pl-5">
                <li>For seasons and rating, if the value is within 2 of the target player's value, the tile will be yellow.</li>
                <li>For team, the tile will be yellow if target player's team is in the same division as the current guess.</li>
              </ul>
              <p><span className="font-bold text-gray-600">Gray</span> means the guess's attribute isn't close.</p>
            </div>
            
            <p>See if you can guess the day's player in 8 or fewer attempts. And if you get it right, share your result with your friends!</p>
            
            <p className="font-bold italic">Also if you get today's player, you'll want your sound on …</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">FAQ</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold">When does the day's player change?</p>
              <p>There will be a new player at midnight PST.</p>
            </div>
            
            <div>
              <p className="font-bold">What about players with multiple positions?</p>
              <p>The player's position will map to their primary one in NBA 2k. For example, if the player's position is PG/SG in 2k, their primary position will be PG. If it's SG/PG, it will be SG.</p>
            </div>
            
            <div>
              <p className="font-bold">What about multiple nationalities?</p>
              <p>Similar to position, it will map to their primary country in 2k.</p>
            </div>
            
            <div>
              <p className="font-bold">How does team work for legends who played on multiple teams?</p>
              <p>It will map to the team where their rating was highest. Ex: Shaq peaked at 98 on the Lakers but 93 on the Magic, so he will be a Laker in the game.</p>
            </div>
            
            <div>
              <p className="font-bold">How can I see players in the game?</p>
              <p>
                Click the list icon in the top right (next to the info icon) or <Link to="/players" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">click here</Link>.
                The list of all players and their attributes will be there.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HowToPlayModal;