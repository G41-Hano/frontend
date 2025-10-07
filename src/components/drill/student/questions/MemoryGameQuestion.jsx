import React, { useState, useEffect } from 'react';

const MemoryGameQuestion = ({ question, onAnswer }) => {
  const [flipped, setFlipped] = useState([]); // array of card ids currently flipped
  const [matched, setMatched] = useState([]); // array of card ids that are matched
  const [lock, setLock] = useState(false); // prevent flipping more than 2 at a time
  const [incorrectAttempts, setIncorrectAttempts] = useState(0); // track incorrect pair attempts

  // Shuffle cards on first render
  const [shuffledCards] = useState(() => {
    const cards = [...(question.memoryCards || [])];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  });

  useEffect(() => {
    if (matched.length === shuffledCards.length && shuffledCards.length > 0) {
      // All pairs matched, call onAnswer with the matched pairs and incorrect attempts
      console.log(`MemoryGameQuestion - All matched! Matched: ${matched.length}, Incorrect attempts: ${incorrectAttempts}`);
      onAnswer(matched, incorrectAttempts);
    }
    // eslint-disable-next-line
  }, [matched]);

  const handleFlip = (cardId) => {
    if (lock || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setLock(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = shuffledCards.find(c => c.id === firstId);
      const secondCard = shuffledCards.find(c => c.id === secondId);
      if (firstCard && secondCard && firstCard.pairId === secondCard.id) {
        // It's a match!
        setTimeout(() => {
          setMatched(prev => [...prev, firstId, secondId]);
          setFlipped([]);
          setLock(false);
        }, 700);
      } else {
        // Not a match - increment incorrect attempts
        setIncorrectAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`MemoryGameQuestion - Wrong pair! Attempts: ${prev} -> ${newAttempts}`);
          return newAttempts;
        });
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 1000);
      }
    }
  };

  const renderCardContent = (card) => {
    if (card.media) {
      let src = null;
      let type = '';
      
      // Handle different media formats
      if (card.media instanceof File) {
        src = URL.createObjectURL(card.media);
        type = card.media.type;
      } else if (typeof card.media === 'string') {
        src = card.media.startsWith('http') ? card.media : `http://127.0.0.1:8000${card.media}`;
        // Try to determine type from file extension
        const ext = card.media.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          type = 'image/*';
        } 
      } else if (card.media.url) {
        src = card.media.url.startsWith('http') ? card.media.url : `http://127.0.0.1:8000${card.media.url}`;
        type = card.media.type || '';
      }

      if (type.startsWith('image/')) {
        return <img src={src} alt="card" className="w-full h-24 object-contain rounded" />;
      } 
    }
    if (card.content) {
      return <span className="text-lg font-semibold">{card.content}</span>;
    }
    return <span className="text-gray-400">No content</span>;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-2xl font-bold mb-4 text-[#8e44ad]">
        {matched.length === shuffledCards.length && shuffledCards.length > 0
          ? 'All pairs matched!'
          : flipped.length === 2
            ? 'Checking...'
            : 'Flip two cards to find a match.'}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
        {shuffledCards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-xl shadow-lg border-2 transition-all duration-300 flex items-center justify-center bg-white ${isFlipped ? 'ring-4 ring-[#8e44ad] scale-105' : 'hover:scale-105'}`}
              onClick={() => handleFlip(card.id)}
              disabled={isFlipped || lock}
              style={{ perspective: 1000 }}
            >
              <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isFlipped ? '' : 'rotate-y-180'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {isFlipped ? (
                  renderCardContent(card)
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#8e44ad] bg-[#f1f2f6] rounded-xl">
                    <i className="fa-regular fa-circle-question"></i>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryGameQuestion;
