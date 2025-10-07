import MemoryGameCard from './MemoryGameCard';

const MemoryGameQuestionForm = ({ question, onChange, setNotification, setMediaModal }) => {
  const addCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      content: '',
      pairId: '',
      media: null
    };
    onChange({
      ...question,
      memoryCards: [...(question.memoryCards || []), newCard]
    });
  };

  const removeCard = (cardId) => {
    const cards = (question.memoryCards || []).filter(card => card.id !== cardId);
    // Remove pairings to this card
    const updatedCards = cards.map(card => {
      if (card.pairId === cardId) {
        return { ...card, pairId: '' };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCard = (cardId, field, value) => {
    const updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, [field]: value };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCardMedia = (cardId, file) => {
    const updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, media: file };
      }
      return card;
    });
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  const updateCardPair = (cardId, pairId) => {
    let updatedCards = (question.memoryCards || []).map(card => {
      if (card.id === cardId) {
        return { ...card, pairId };
      }
      // If this card was previously paired with cardId, clear it if the new pairId is not this card
      if (card.pairId === cardId && pairId !== card.id) {
        return { ...card, pairId: '' };
      }
      return card;
    });
    // Make the pairing mutual
    if (pairId) {
      updatedCards = updatedCards.map(card => {
        if (card.id === pairId) {
          return { ...card, pairId: cardId };
        }
        return card;
      });
    }
    onChange({
      ...question,
      memoryCards: updatedCards
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Memory Game Cards</h3>
        <button
          type="button"
          onClick={addCard}
          className="px-3 py-1 bg-[#4C53B4] text-white rounded hover:bg-[#3a3f8f]"
        >
          Add Card
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(question.memoryCards || []).map((card) => (
          <MemoryGameCard
            key={card.id}
            card={card}
            cards={question.memoryCards}
            onRemove={() => removeCard(card.id)}
            onTextChange={(value) => updateCard(card.id, 'content', value)}
            onMediaChange={(file) => updateCardMedia(card.id, file)}
            onPairChange={(pairId) => updateCardPair(card.id, pairId)}
            setNotification={setNotification}
            setMediaModal={setMediaModal}
          />
        ))}
      </div>
      {(question.memoryCards || []).length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <i className="fa-solid fa-info-circle mr-2"></i>
            Make sure to add an even number of cards for matching pairs. Each card should have either text or media content. Use the 'Pair With' dropdown to set matching pairs. Each pair must be unique and mutual.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryGameQuestionForm;