import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VocabularyAdventure from './VocabularyAdventure';

const InteractiveLearning = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [currentModule, setCurrentModule] = useState('vocabulary');

  // Example of an interactive learning scenario
  const handleInteraction = (choice) => {
    // Process user's choice and provide immediate feedback
    if (choice.correct) {
      setScore(prev => prev + 10);
      // Trigger success animation and feedback
    } else {
      // Provide constructive feedback and hints
    }
  };

  const handleModuleComplete = () => {
    setScore(prev => prev + 30);
    setCurrentLevel(prev => prev + 1);
    // You can add logic here to switch to different modules
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-4 mb-8 shadow-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Level {currentLevel}</h2>
            <div className="text-xl font-semibold text-purple-600">Score: {score}</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
            <motion.div
              className="bg-purple-600 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(score / 100) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Interactive Learning Area */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          {currentModule === 'vocabulary' && (
            <VocabularyAdventure onComplete={handleModuleComplete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveLearning;
