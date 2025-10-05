import { useState } from 'react';

export const useAIQuestionGenerator = () => {
  const [aiLoading, setAiLoading] = useState({
    definition: false,
    question: false,
    sentence: false
  });

  // Generate definition for word function
  const generateDefinitionForWord = async (index, word, definitionFetcher, handleUpdateCustomWord, setNotification) => {
    if (!word) return;
    
    setAiLoading(prev => ({ ...prev, definition: true }));
    try {
      const definition = await definitionFetcher(word);
      handleUpdateCustomWord(index, 'definition', definition);
      setNotification({
        show: true,
        message: 'Definition generated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate definition:', err);
      setNotification({
        show: true,
        message: 'Failed to generate definition: ' + (err.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, definition: false }));
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  // AI question generation function
  const generateQuestion = async (questionDraft, selectedQuestionWord, selectedQuestionWordData, getAvailableWords, setQuestionDraft, setNotification) => {
    setAiLoading(prev => ({ ...prev, question: true }));
    try {
      let defaultQuestion = '';
      let defaultAnswer = '';
      let defaultChoices = [];
      let defaultPattern = '';
      let defaultHint = '';
      let word = '';
      let pattern = '';
      let missingLetters = [];
      let letterChoices = [];
      const allPossibleLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      
      // Generate default content based on question type
      switch(questionDraft.type) {
        case 'M': {
          // Get available words excluding the current word
          const availableWords = getAvailableWords().filter(w => w.word !== selectedQuestionWord);
          
          // Shuffle available words for random selection
          const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
          
          // Create choices array with correct definition and other word definitions
          let choices = [];
          
          // Randomly place the correct answer
          const correctAnswerPosition = Math.floor(Math.random() * 4); // Random position 0-3
          
          // Fill all positions
          for (let i = 0; i < 4; i++) {
            if (i === correctAnswerPosition) {
              choices[i] = { text: selectedQuestionWordData.definition || 'Correct definition here', media: null };
            } else {
              const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
              choices[i] = { text: otherWord?.definition || `Alternative word definition ${i + 1}`, media: null };
            }
          }

          defaultQuestion = `What is the definition of "${selectedQuestionWord}"?`;
          defaultChoices = choices;
          defaultAnswer = correctAnswerPosition;
          break;
        }
          
        case 'F': {
          word = selectedQuestionWord.toUpperCase();
          
          // Ensure word is at least 4 letters long
          if (word.length < 4) {
            throw new Error('Word must be at least 4 letters long for Blank Buster');
          }
          
          // Create pattern with first and last letters visible
          pattern = word.split('').map((char, idx) => 
            idx === 0 || idx === word.length - 1 ? char : '_'
          ).join(' ');
          
          // Find missing letter indices
          const missingIndices = word.split('').reduce((acc, char, idx) => {
            if (idx !== 0 && idx !== word.length - 1) acc.push(idx);
            return acc;
          }, []);
          
          // Get missing letters
          missingLetters = missingIndices.map(idx => word[idx]);
          
          // Create letter choices: include missing letters (with duplicates) and some random letters
          letterChoices = [
            ...missingLetters, 
            ...allPossibleLetters
              .filter(l => !missingLetters.includes(l))
              .sort(() => Math.random() - 0.5)
              .slice(0, Math.max(0, 6 - missingLetters.length))
          ].sort(() => Math.random() - 0.5);
          
          defaultQuestion = `Complete the word: ${pattern}`;
          defaultPattern = pattern;
          defaultAnswer = word;
          defaultHint = selectedQuestionWordData.definition || '';
          break;
        }
          
        case 'S': {
          // Get available words excluding the current word
          const availableWords = getAvailableWords().filter(w => w.word !== selectedQuestionWord);
          
          // Shuffle available words for random selection
          const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
          
          // Create choices array with correct word and other words
          let choices = [];
          
          // Randomly place the correct answer
          const correctAnswerPosition = Math.floor(Math.random() * 4); // Random position 0-3
          
          // Fill all positions
          for (let i = 0; i < 4; i++) {
            if (i === correctAnswerPosition) {
              choices[i] = { text: selectedQuestionWord, media: null };
            } else {
              const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
              choices[i] = { text: otherWord?.word || `Word ${i + 1}`, media: null };
            }
          }

          defaultQuestion = selectedQuestionWordData.definition || `Select the correct word for: ${selectedQuestionWord}`;
          defaultChoices = choices;
          defaultAnswer = correctAnswerPosition;
          break;
        }
          
        case 'D': {
          defaultQuestion = `Build the correct sentence using the given words`;
          defaultAnswer = selectedQuestionWord;
          break;
        }
          
        case 'G': {
          defaultQuestion = `Find matching pairs to complete this exercise`;
          break;
        }
          
        case 'P': {
          defaultQuestion = `What word connects all these pictures?`;
          defaultAnswer = selectedQuestionWord;
          break;
        }
        
        default:
          break;
      }

      const newQuestionDraft = {
        ...questionDraft,
        text: defaultQuestion,
        answer: defaultAnswer,
        pattern: defaultPattern,
        hint: defaultHint,
        choices: defaultChoices,
        letterChoices: letterChoices,
        missingLetters: missingLetters
      };

      setQuestionDraft(newQuestionDraft);
      setNotification({
        show: true,
        message: 'Question generated successfully!',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to generate question:', err);
      setNotification({
        show: true,
        message: 'Failed to generate question: ' + (err.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setAiLoading(prev => ({ ...prev, question: false }));
      setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
    }
  };

  return {
    aiLoading,
    setAiLoading,
    generateDefinitionForWord,
    generateQuestion
  };
};

export default useAIQuestionGenerator;
