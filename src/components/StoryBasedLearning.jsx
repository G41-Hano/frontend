import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StoryBasedLearning = ({ onComplete }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [userChoices, setUserChoices] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);

  const story = {
    title: "The Digital Quest",
    chapters: [
      {
        id: 1,
        title: "The Mysterious Bug",
        content: `You're a junior developer at TechCorp, and your team's main application has started behaving strangely. 
        Users are reporting that the login system isn't working properly. Your mentor, Sarah, approaches you with a concerned look.
        "We need to figure out what's going on with the authentication system," she says. "Where would you like to start?"`,
        choices: [
          {
            text: "Check the server logs for error messages",
            correct: true,
            feedback: "Good thinking! Server logs often contain valuable information about what's going wrong.",
            nextChapter: 1
          },
          {
            text: "Ask users to try logging in again",
            correct: false,
            feedback: "While user feedback is important, we should first gather more technical information about the issue.",
            nextChapter: 1
          },
          {
            text: "Restart the server and hope it fixes itself",
            correct: false,
            feedback: "While server restarts can sometimes help, it's better to understand the root cause first.",
            nextChapter: 1
          }
        ]
      },
      {
        id: 2,
        title: "The Log Investigation",
        content: `You find several error messages in the logs:
        "TypeError: Cannot read property 'token' of undefined"
        This error appears whenever users try to log in. Sarah looks at you expectantly.
        "What do you think this error means?"`,
        choices: [
          {
            text: "The authentication token is missing or not being properly passed",
            correct: true,
            feedback: "Exactly! This suggests the token isn't being properly handled in the authentication flow.",
            nextChapter: 2
          },
          {
            text: "The server is running out of memory",
            correct: false,
            feedback: "This error is specifically about accessing a property of an undefined object, not a memory issue.",
            nextChapter: 2
          },
          {
            text: "The database connection is failing",
            correct: false,
            feedback: "This error is about JavaScript object properties, not database connectivity.",
            nextChapter: 2
          }
        ]
      },
      {
        id: 3,
        title: "The Solution",
        content: `Now that you've identified the issue, Sarah asks:
        "What would be the best way to fix this token problem?"`,
        choices: [
          {
            text: "Add proper error handling and token validation in the authentication middleware",
            correct: true,
            feedback: "Perfect! This is a robust solution that will prevent the error and provide better security.",
            nextChapter: 3
          },
          {
            text: "Remove the token requirement completely",
            correct: false,
            feedback: "While this might fix the error, it would compromise security. We need to handle the token properly.",
            nextChapter: 3
          },
          {
            text: "Add a try-catch block to ignore the error",
            correct: false,
            feedback: "Simply catching and ignoring the error would hide the problem rather than solve it.",
            nextChapter: 3
          }
        ]
      }
    ]
  };

  const handleChoice = (choice) => {
    setUserChoices([...userChoices, choice]);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      if (currentChapter < story.chapters.length - 1) {
        setCurrentChapter(prev => prev + 1);
      } else {
        onComplete();
      }
    }, 2000);
  };

  const currentChapterData = story.chapters[currentChapter];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-8">
        <motion.h2 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-gray-800 mb-6"
        >
          {story.title}
        </motion.h2>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">
                Chapter {currentChapterData.id}: {currentChapterData.title}
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {currentChapterData.content}
              </p>
            </div>

            <div className="space-y-3">
              {currentChapterData.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => handleChoice(choice)}
                >
                  {choice.text}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 p-4 rounded-lg ${
                userChoices[userChoices.length - 1]?.correct
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {userChoices[userChoices.length - 1]?.feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StoryBasedLearning; 