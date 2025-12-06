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
      let defaultQuestionMedia = null;
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
          
          // Randomly select question type (weighted)
          const random = Math.random();
          let questionType;
          
          // Check what media is available for the current word
          const hasImage = !!(selectedQuestionWordData.image || selectedQuestionWordData.image_url);
          const hasVideo = !!(selectedQuestionWordData.signVideo || selectedQuestionWordData.video_url);
          
          // console.log('Media check for', selectedQuestionWord, ':', { 
          //   hasImage, 
          //   hasVideo,
          //   image: selectedQuestionWordData.image,
          //   signVideo: selectedQuestionWordData.signVideo,
          //   image_url: selectedQuestionWordData.image_url,
          //   video_url: selectedQuestionWordData.video_url
          // });
          
          // Determine available question types based on media
          const availableTypes = [];
          if (hasImage) availableTypes.push('identify_image', 'what_word_image');
          if (hasVideo) availableTypes.push('identify_sign', 'what_word_sign');
          availableTypes.push('definition', 'meaning'); // Always available
          
          // console.log('Available question types:', availableTypes);
          
          // Randomly select from available types
          questionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          
          // console.log('Selected question type:', questionType);
          
          // Create choices array
          let choices = [];
          const correctAnswerPosition = Math.floor(Math.random() * 4);
          
          switch(questionType) {
            case 'identify_sign': {
              // Question: "What is the sign for [word]?" - Choices: sign videos
              defaultQuestion = `What is the sign for "${selectedQuestionWord}"?`;
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  const videoSource = selectedQuestionWordData.video_url || selectedQuestionWordData.signVideo;
                  if (videoSource) {
                    choices[i] = { 
                      text: '', 
                      media: videoSource instanceof File ? videoSource : { url: videoSource, type: 'video/mp4' }
                    };
                  } else {
                    choices[i] = { text: '', media: null };
                  }
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  if (otherWord && (otherWord.signVideo || otherWord.video_url)) {
                    const videoSource = otherWord.video_url || otherWord.signVideo;
                    choices[i] = { 
                      text: '', 
                      media: videoSource instanceof File ? videoSource : { url: videoSource, type: 'video/mp4' }
                    };
                  } else {
                    choices[i] = { text: otherWord?.word || `Option ${i + 1}`, media: null };
                  }
                }
              }
              break;
            }
            
            case 'what_word_sign': {
              // Question: "What word does this sign show?" - Show video, choices: words
              defaultQuestion = `What word does this sign show?`;
              
              // Set the video in questionMedia
              const videoSource = selectedQuestionWordData.video_url || selectedQuestionWordData.signVideo;
              if (videoSource) {
                defaultQuestionMedia = videoSource instanceof File ? videoSource : { url: videoSource, type: 'video/mp4' };
              }
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  choices[i] = { text: selectedQuestionWord, media: null };
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  choices[i] = { text: otherWord?.word || `Word ${i + 1}`, media: null };
                }
              }
              break;
            }
            
            case 'identify_image': {
              // Question: "Which picture shows [word]?" - Choices: images
              defaultQuestion = `Which picture shows "${selectedQuestionWord}"?`;
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  const imageSource = selectedQuestionWordData.image_url || selectedQuestionWordData.image;
                  if (imageSource) {
                    choices[i] = { 
                      text: '', 
                      media: imageSource instanceof File ? imageSource : { url: imageSource, type: 'image/jpeg' }
                    };
                  } else {
                    choices[i] = { text: '', media: null };
                  }
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  if (otherWord && (otherWord.image || otherWord.image_url)) {
                    const imageSource = otherWord.image_url || otherWord.image;
                    choices[i] = { 
                      text: '', 
                      media: imageSource instanceof File ? imageSource : { url: imageSource, type: 'image/jpeg' }
                    };
                  } else {
                    choices[i] = { text: otherWord?.word || `Option ${i + 1}`, media: null };
                  }
                }
              }
              break;
            }
            
            case 'what_word_image': {
              // Question: "What word does this picture show?" - Show image, choices: words
              defaultQuestion = `What word does this picture show?`;
              
              // Set the image in questionMedia
              const imageSource = selectedQuestionWordData.image_url || selectedQuestionWordData.image;
              if (imageSource) {
                defaultQuestionMedia = imageSource instanceof File ? imageSource : { url: imageSource, type: 'image/jpeg' };
              }
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  choices[i] = { text: selectedQuestionWord, media: null };
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  choices[i] = { text: otherWord?.word || `Word ${i + 1}`, media: null };
                }
              }
              break;
            }
            
            case 'meaning': {
              // Question: "What does [word] mean?" - Choices: definitions
              defaultQuestion = `What does "${selectedQuestionWord}" mean?`;
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  choices[i] = { text: selectedQuestionWordData.definition || 'Correct meaning here', media: null };
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  choices[i] = { text: otherWord?.definition || `Another meaning ${i + 1}`, media: null };
                }
              }
              break;
            }
            
            default: // 'definition'
              // Question: definition - Choices: words
              defaultQuestion = selectedQuestionWordData.definition || `Select the correct word for: ${selectedQuestionWord}`;
              
              for (let i = 0; i < 4; i++) {
                if (i === correctAnswerPosition) {
                  choices[i] = { text: selectedQuestionWord, media: null };
                } else {
                  const otherWord = shuffledWords[choices.filter((c, idx) => idx !== correctAnswerPosition && c !== undefined).length];
                  choices[i] = { text: otherWord?.word || `Word ${i + 1}`, media: null };
                }
              }
          }

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
          
          defaultQuestion = `Fill in the letters`;
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
          defaultQuestion = `Make a sentence`;
          defaultAnswer = selectedQuestionWord;
          break;
        }
          
        case 'G': {
          defaultQuestion = `Match the pairs`;
          break;
        }
          
        case 'P': {
          defaultQuestion = `What word is this?`;
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
        missingLetters: missingLetters,
        questionMedia: defaultQuestionMedia
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
