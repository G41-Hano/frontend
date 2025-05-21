import React, { useState } from 'react';
import { motion } from 'framer-motion';

const InteractiveModule = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');

  // Example of an interactive learning scenario
  const scenario = {
    title: "The Code Adventure",
    steps: [
      {
        type: "interactive",
        content: "You're a programmer debugging a critical system. The code is showing an error. What's your first step?",
        options: [
          { text: "Read the error message carefully", correct: true },
          { text: "Restart the computer", correct: false },
          { text: "Delete the code and start over", correct: false }
        ]
      },
      {
        type: "puzzle",
        content: "The error message shows: 'TypeError: Cannot read property 'length' of undefined'. What's the most likely cause?",
        options: [
          { text: "A variable is undefined when trying to access its length", correct: true },
          { text: "The code is too long", correct: false },
          { text: "The computer is running out of memory", correct: false }
        ]
      }
    ]
  };

  const handleChoice = (choice) => {
    if (choice.correct) {
      setFeedback("Excellent choice! That's the right approach.");
      setTimeout(() => {
        if (currentStep < scenario.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setFeedback('');
        } else {
          onComplete();
        }
      }, 1500);
    } else {
      setFeedback("Not quite right. Think about it again - what would be the most logical first step?");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 shadow-lg"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{scenario.title}</h3>
      
      <div className="mb-6">
        <p className="text-lg text-gray-700 mb-4">
          {scenario.steps[currentStep].content}
        </p>
        
        <div className="space-y-3">
          {scenario.steps[currentStep].options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              onClick={() => handleChoice(option)}
            >
              {option.text}
            </motion.button>
          ))}
        </div>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 rounded-lg ${
            feedback.includes("Excellent") ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {feedback}
        </motion.div>
      )}
    </motion.div>
  );
};

export default InteractiveModule;
