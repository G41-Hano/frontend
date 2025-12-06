import React from 'react';
import DrillHeader from './DrillHeader';
import IntroBubble from './IntroBubble';
import HippoIdle from '../../../assets/HippoIdle.gif';
//import GameReminderImg from '../../../assets/GameReminder.png';
import GameReminderImg from '../../../assets/usabilityTestGM.jpg';

const transitions = [
  "Now let's test your knowledge!",
  "Ready for a challenge?",
  "Let's see what you remember!",
  "Time to play a game!",
];

const DrillIntroSteps = ({ 
  drillBg,
  introStep,
  drill,
  wordlistData,
  currentWord,
  progress,
  points,
  onBack,
  onExit,
  onNext
}) => {
  const totalPoints = Object.values(points).reduce((a, b) => a + (b || 0), 0);

  const getIntroContent = () => {
    switch (introStep) {
      case 0:
        return {
          mascot: HippoIdle,
          // Return a React node to style part of the text
          text: (
            <span>
              {"Hi I'm Hano, and today we'll learn about "}
              <span style={{ color: '#4C53B4', fontWeight: 700 }}>
                {wordlistData?.name || drill.title}
              </span>
              {". Are you ready to learn? Click Next to start!"}
            </span>
          )
        };
      case 1:
        return {
          mascot: HippoIdle,
          text: (
            <span>
              {wordlistData?.description || "Let's explore these words together!"}
            </span>
          )
        };
      case 2:
        return {
          mascot: HippoIdle,
          // Small styled label with timer/hourglass icon (larger for readability)
          text: (
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center text-white shadow-md" aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 2h12M6 22h12M8 6h8M8 18h8" opacity="0.2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10l-1 4a4 4 0 01-2 2.5V13a4 4 0 012 2.5l1 4H7l1-4A4 4 0 0110 15V9.5A4 4 0 018 7.5L7 3z" />
                </svg>
              </span>
              <span className="text-2xl font-bold text-[#4C53B4]">Game Reminders</span>
            </span>
          ),
          image: GameReminderImg
        };
      case 3:
        return {
          mascot: HippoIdle,
          text: (
            <span>
              {"The word is "} 
                <span style={{ color: '#4C53B4', fontWeight: 700 }}> 
                  {currentWord.word}
              </span>
              {"."}
            </span>
          ),
          image: currentWord.image
        };
      case 4:
        // Format: "A/An [word] is [definition]" with proper article and lowercase definition
        const def = currentWord.definition || '';
        const wordToHighlight = currentWord.word || '';
        
        // Determine if we should use "A" or "An" based on first letter
        //const firstLetter = wordToHighlight.charAt(0).toLowerCase();
       // const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'An' : 'A';
        
        // Make sure definition starts with lowercase
        const formattedDef = def.charAt(0).toLowerCase() + def.slice(1);
        
        return {
          mascot: HippoIdle,
          text: (
            <span>
            {/*  {article + " "}  // Commented out to remove article */}
              <span style={{ color: '#4C53B4', fontWeight: 700 }}>
                {wordToHighlight}
              </span>
              {" means "}
              {formattedDef}
              {"."}
            </span>
          ),
          image: currentWord.image
        };
      case 5:
        return {
          mascot: HippoIdle,
          text: (
            <span>
              {"This is the sign language of "}
                <span style={{ color: '#4C53B4', fontWeight: 700 }}>
                  {currentWord.word}
                </span>
              {". Can you read it with me? Play the video to see how!"}
            </span>          
          ),
          video: currentWord.signVideo
        };
      case 6:
        return {
          mascot: HippoIdle,
          text: transitions[Math.floor(Math.random() * transitions.length)]
        };
      default:
        return {
          mascot: HippoIdle,
          text: "Let's continue!"
        };
    }
  };

  const content = getIntroContent();

  return (
    <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <DrillHeader 
        onBack={onExit || onBack}
        progress={progress}
        points={totalPoints}
        drillTitle={drill?.title}
        wordlistName={wordlistData?.name}
      />
      
      <IntroBubble
        mascot={content.mascot}
        text={content.text}
        image={content.image}
        video={content.video}
      />
      
      { /* Show Back only when introStep > 0 - for the first intro we hide Back */ }
      {typeof introStep === 'number' && introStep > 0 && introStep <= 5 && (
        <button
          className="fixed bottom-12 left-12 px-6 py-3 bg-white text-[#4C53B4] rounded-xl text-lg font-bold hover:bg-gray-100 shadow-lg z-50 border border-gray-200"
          onClick={onBack}
        >
          Back
        </button>
      )}

      <button
        className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
        onClick={onNext}
      >
        Next
      </button>
    </div>
  );
};

export default DrillIntroSteps;
