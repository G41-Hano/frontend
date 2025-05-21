import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VocabularyAdventure = ({ onComplete }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [userChoices, setUserChoices] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const story = {
    title: "The Word Explorer's Journey",
    chapters: [
      {
        id: 1,
        title: "The Magical Garden",
        content: `Welcome to the Magical Garden! 🌸
        
        Today, we're going to learn about different types of flowers. Look at the beautiful garden around you!
        
        Can you help the garden grow by matching the correct word with its picture?`,
        choices: [
          {
            text: "🌹 Rose - A beautiful flower with thorns",
            correct: true,
            feedback: "Excellent! You found the rose! The sign for 'rose' is made by making a fist and moving it in a circular motion near your nose.",
            points: 10,
            image: "rose.png"
          },
          {
            text: "🌻 Sunflower - A tall flower that follows the sun",
            correct: false,
            feedback: "That's a sunflower! While it's a beautiful flower, we're looking for the rose. The sign for 'sunflower' is made by making a circle with your hands and moving them up and down.",
            points: 5,
            image: "sunflower.png"
          },
          {
            text: "🌸 Cherry Blossom - A delicate pink flower",
            correct: false,
            feedback: "That's a cherry blossom! While it's pretty, we're looking for the rose. The sign for 'cherry blossom' is made by wiggling your fingers near your shoulder.",
            points: 5,
            image: "cherry-blossom.png"
          }
        ]
      },
      {
        id: 2,
        title: "The Colorful Challenge",
        content: `Now that we've learned about flowers, let's learn about colors!
        
        Look at the rainbow in the sky. 🌈
        
        Which color is missing from this sequence: Red, Orange, Yellow, Green, Blue, _____?`,
        choices: [
          {
            text: "Purple - The color of royalty",
            correct: true,
            feedback: "Perfect! You found the missing color! The sign for 'purple' is made by making a 'P' handshape and shaking it slightly.",
            points: 10,
            image: "purple.png"
          },
          {
            text: "Pink - A light red color",
            correct: false,
            feedback: "Pink is a beautiful color, but it's not in the rainbow! The sign for 'pink' is made by making a 'P' handshape and moving it down your cheek.",
            points: 5,
            image: "pink.png"
          },
          {
            text: "Brown - The color of chocolate",
            correct: false,
            feedback: "Brown is a nice color, but it's not in the rainbow! The sign for 'brown' is made by making a 'B' handshape and moving it down your cheek.",
            points: 5,
            image: "brown.png"
          }
        ]
      },
      {
        id: 3,
        title: "The Animal Friends",
        content: `Let's meet some animal friends! 🐾
        
        Each animal has a special way to move. Can you match the animal with how it moves?`,
        choices: [
          {
            text: "🐰 Rabbit - Hops on its back legs",
            correct: true,
            feedback: "Great job! You matched the rabbit with its movement! The sign for 'rabbit' is made by making bunny ears with your fingers and moving them up and down.",
            points: 10,
            image: "rabbit.png"
          },
          {
            text: "🐍 Snake - Slithers on the ground",
            correct: false,
            feedback: "That's how a snake moves! While it's correct, we're looking for the rabbit's movement. The sign for 'snake' is made by making a 'S' handshape and moving it in a wavy motion.",
            points: 5,
            image: "snake.png"
          },
          {
            text: "🦋 Butterfly - Flies with colorful wings",
            correct: false,
            feedback: "That's how a butterfly moves! While it's correct, we're looking for the rabbit's movement. The sign for 'butterfly' is made by crossing your hands and moving them like wings.",
            points: 5,
            image: "butterfly.png"
          }
        ]
      }
    ]
  };

  const handleChoice = (choice) => {
    setUserChoices([...userChoices, choice]);
    setShowFeedback(true);
    setScore(prev => prev + choice.points);

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

        <div className="mb-4 text-right">
          <span className="text-xl font-semibold text-purple-600">
            Score: {score}
          </span>
        </div>

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
              <p className="text-gray-700 whitespace-pre-line text-lg">
                {currentChapterData.content}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentChapterData.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-4"
                  onClick={() => handleChoice(choice)}
                >
                  <span className="text-3xl">{choice.text.split(' - ')[0]}</span>
                  <div>
                    <p className="font-semibold">{choice.text.split(' - ')[1]}</p>
                  </div>
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
              <p className="text-lg">
                {userChoices[userChoices.length - 1]?.feedback}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VocabularyAdventure; 