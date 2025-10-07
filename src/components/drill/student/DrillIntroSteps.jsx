import React from 'react';
import DrillHeader from './DrillHeader';
import IntroBubble from './IntroBubble';
import HippoIdle from '../../../assets/HippoIdle.gif';

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
  currentWord,
  progress,
  points,
  onBack,
  onNext
}) => {
  const totalPoints = Object.values(points).reduce((a, b) => a + (b || 0), 0);

  const getIntroContent = () => {
    switch (introStep) {
      case 0:
        return {
          mascot: HippoIdle,
          text: `Hi I'm Hano, and today we'll learn about ${drill.wordlist_name || drill.title}. Are you ready to learn? Click Next to start!`
        };
      case 1:
        return {
          mascot: HippoIdle,
          text: `This is a ${currentWord.word}`,
          image: currentWord.image
        };
      case 2:
        return {
          mascot: HippoIdle,
          text: currentWord.definition,
          image: currentWord.image
        };
      case 3:
        return {
          mascot: HippoIdle,
          text: `This is the sign language for ${currentWord.word}. Can you sign it with me? Play the video to see how!`,
          video: currentWord.signVideo
        };
      case 4:
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
        onBack={onBack}
        progress={progress}
        points={totalPoints}
      />
      
      <IntroBubble
        mascot={content.mascot}
        text={content.text}
        image={content.image}
        video={content.video}
      />
      
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
