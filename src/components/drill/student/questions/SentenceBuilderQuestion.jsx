import React, { useState, useEffect } from 'react';
import { DndContext, useSensors, useSensor, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { PointerSensor } from '@dnd-kit/core';

// Custom Draggable component
const Draggable = ({ id, disabled, children }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled
  });
  
  return children({ attributes, listeners, setNodeRef, isDragging });
};

// Custom Droppable component
const Droppable = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id
  });
  
  return children({ isOver, setNodeRef });
};

const SentenceBuilderQuestion = ({ question, onAnswer, currentAnswer }) => {
  const sentence = question.sentence || '';
  const blanksCount = (sentence.match(/_/g) || []).length;
  const [blankAnswers, setBlankAnswers] = useState(() =>
    Array.isArray(currentAnswer) && currentAnswer.length === blanksCount
      ? currentAnswer
      : Array(blanksCount).fill(null)
  );
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    setBlankAnswers(
      Array.isArray(currentAnswer) && currentAnswer.length === blanksCount
        ? currentAnswer
        : Array(blanksCount).fill(null)
    );
  }, [question]);

  // Combine correct and incorrect choices, shuffle on mount
  const [choices] = useState(() => {
    const all = [...(question.dragItems || []), ...(question.incorrectChoices || [])];
    return all.sort(() => Math.random() - 0.5);
  });

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Build the sentence display
  let blankIdx = 0;
  const parts = sentence.split('_');
  const display = [];
  for (let i = 0; i < parts.length; i++) {
    display.push(<span key={`part-${i}`} className="text-2xl">{parts[i]}</span>);
    if (i < parts.length - 1) {
      const answerIdx = blankAnswers[blankIdx];
      const currentBlankIdx = blankIdx;
      display.push(
        <Droppable key={`blank-${blankIdx}`} id={`blank-${blankIdx}`}>
          {({ isOver, setNodeRef }) => (
            <div
              ref={setNodeRef}
              onClick={() => {
                if (answerIdx !== null && !isCorrect) {
                  setHasInteracted(true);
                  const newAnswers = [...blankAnswers];
                  newAnswers[currentBlankIdx] = null;
                  setBlankAnswers(newAnswers);
                  setShowTryAgain(false);
                  setIsIncorrect(false);
                }
              }}
              className={`inline-flex items-center justify-center min-w-[150px] h-12 mx-2 align-middle cursor-pointer relative text-xl
                ${answerIdx !== null 
                  ? 'bg-white border-2' 
                  : 'bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30'} 
                ${isIncorrect && answerIdx !== null ? 'border-red-500 animate-shake' : ''}
                ${isCorrect && answerIdx !== null ? 'border-green-500' : ''}
                ${isOver ? 'border-[#4C53B4] bg-[#EEF1F5] scale-105' : ''}
                rounded-lg transition-all duration-200`}
            >
              {answerIdx !== null ? choices[answerIdx]?.text : ''}
            </div>
          )}
        </Droppable>
      );
      blankIdx++;
    }
  }

  // Check if all blanks are filled
  const isComplete = blankAnswers.every(idx => idx !== null);

  // Auto-check answer when all blanks are filled
  useEffect(() => {
    if (isComplete && !isCorrect && hasInteracted) {
      // Build the complete sentence by replacing blanks with user's answers
      let userSentence = sentence;
      let blankIndex = 0;
      userSentence = userSentence.replace(/_/g, () => {
        const choiceIdx = blankAnswers[blankIndex];
        const word = choiceIdx !== null ? choices[choiceIdx]?.text || '' : '';
        blankIndex++;
        return word;
      });
      
      // Build the correct answer by replacing blanks with dragItems in order
      let correctAnswer = sentence;
      let dragItemIndex = 0;
      correctAnswer = correctAnswer.replace(/_/g, () => {
        const dragItem = question.dragItems && question.dragItems[dragItemIndex];
        const word = dragItem ? dragItem.text || dragItem : '';
        dragItemIndex++;
        return word;
      });
      
      // Compare the complete sentences (normalized)
      const isAllCorrect = userSentence.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
      
      const submittedTexts = blankAnswers.map(idx => choices[idx]?.text || '');
      
      if (isAllCorrect) {
        setIsCorrect(true);
        setIsIncorrect(false);
        setShowTryAgain(false);
        // Send texts instead of indices so backend validation is order/text-based
        onAnswer(submittedTexts, true);
      } else {
        setIsIncorrect(true);
        setShowTryAgain(true);
        onAnswer(submittedTexts, false);
        // Clear answers 
        setTimeout(() => {
          setBlankAnswers(Array(blanksCount).fill(null));
          setIsIncorrect(false);
          setShowTryAgain(false);
        }, 2000); //2 seconds
      }
    }
    // Remove the else clause that was calling onAnswer for incomplete sentences
  }, [isComplete, blankAnswers, hasInteracted]);

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // Reset error states when starting a new drag
    setIsIncorrect(false);
    setShowTryAgain(false);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || isCorrect) return;

    const draggedItemIndex = parseInt(active.id.split('-')[1]);
    const targetBlankIndex = parseInt(over.id.split('-')[1]);

    // Mark that user has interacted
    setHasInteracted(true);

    // Update answers
    const newAnswers = [...blankAnswers];
    newAnswers[targetBlankIndex] = draggedItemIndex;
    setBlankAnswers(newAnswers);
    // Don't call onAnswer here - let the useEffect handle it when complete
  };

  // Choices not yet used
  const used = new Set(blankAnswers.filter(idx => idx !== null));

  // Render draggable item
  const renderDraggableItem = (choice, idx, isDragging = false) => (
    <div
      className={`px-6 py-3 rounded-lg text-lg font-medium bg-white border-2 border-[#4C53B4] text-[#4C53B4] 
        ${used.has(idx) ? 'opacity-50' : 'cursor-grab hover:bg-[#EEF1F5] transition'}
        ${isDragging ? 'opacity-90 scale-110 shadow-2xl' : ''}
        transition-all duration-200`}
    >
      {choice.text}
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="animate-fadeIn">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-2xl">
          {display}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {choices.map((choice, idx) => (
            <Draggable key={`choice-${idx}`} id={`choice-${idx}`} disabled={used.has(idx)}>
              {({ attributes, listeners, setNodeRef, isDragging }) => (
                <div
                  ref={setNodeRef}
                  {...attributes}
                  {...listeners}
                  className={`${isDragging ? 'opacity-30' : ''}`}
                >
                  {renderDraggableItem(choice, idx)}
                </div>
              )}
            </Draggable>
          ))}
        </div>
        <DragOverlay>
          {activeId !== null && renderDraggableItem(choices[parseInt(activeId.split('-')[1])], parseInt(activeId.split('-')[1]), true)}
        </DragOverlay>
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-500 text-center">
            <i className="fa-solid fa-info-circle mr-1"></i>
            Drag words to fill blanks. Click a filled blank to remove its answer.
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default SentenceBuilderQuestion;
