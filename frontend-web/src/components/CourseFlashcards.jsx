import React, { useState, useEffect } from 'react';
import { fetchFlashcards } from '../api/flashcards';

import { cleanFileName } from '../utils/fileUtils';

export default function CourseFlashcards({ courseId }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeDeck, setActiveDeck] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadDecks();
  }, [courseId]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      const data = await fetchFlashcards(courseId);
      setDecks(data);
    } catch (err) {
      setError(err.message || 'Eroare la încărcarea seturilor de flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const startDeck = (deck) => {
    if (deck.cards && deck.cards.length > 0) {
      setActiveDeck(deck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      alert("Acest set nu conține carduri.");
    }
  };

  const nextCard = () => {
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Se încarcă flashcards...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (activeDeck) {
    const card = activeDeck.cards[currentCardIndex];
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold">{activeDeck.title}</h2>
          <button 
            onClick={() => setActiveDeck(null)}
            className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Înapoi la pachete
          </button>
        </div>

        <div className="text-sm text-gray-400">
          Cartonașul {currentCardIndex + 1} din {activeDeck.cards.length}
        </div>

        {/* The Card */}
        <div 
          className={`relative w-full aspect-video cursor-pointer transition-transform duration-500 transform-style-3d`}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: '1000px' }}
        >
          <div className={`absolute w-full h-full p-8 rounded-2xl shadow-xl flex items-center justify-center text-center transition-all duration-500 backface-hidden ${isFlipped ? 'rotate-y-180 opacity-0' : 'bg-white dark:bg-[#1a2230] border-2 border-indigo-500/30'}`}>
            <h3 className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">{card.concept}</h3>
            <span className="absolute bottom-4 text-xs text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>touch_app</span>
              Apasă pentru definiție
            </span>
          </div>

          <div className={`absolute w-full h-full p-8 rounded-2xl shadow-xl flex items-center justify-center text-center transition-all duration-500 backface-hidden ${!isFlipped ? 'rotate-y-180 opacity-0' : 'bg-indigo-600 border-2 border-indigo-500 text-white rotate-y-0'}`}>
            <p className="text-lg leading-relaxed">{card.definition}</p>
            <span className="absolute bottom-4 text-xs text-indigo-200 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{fontSize:'16px'}}>touch_app</span>
              Apasă pentru a întoarce
            </span>
          </div>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button 
            onClick={prevCard} 
            disabled={currentCardIndex === 0}
            className="px-6 py-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold"
          >
            Înapoi
          </button>
          <button 
            onClick={nextCard} 
            disabled={currentCardIndex === activeDeck.cards.length - 1}
            className="px-6 py-2 rounded-full bg-primary text-white disabled:opacity-50 hover:bg-primary/90 transition-colors font-bold"
          >
            Următorul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {decks.length === 0 ? (
        <div className="bg-white dark:bg-[#1a2230] p-8 rounded-xl border text-center text-gray-500">
          Nu ai generat niciun set de flashcards pentru acest curs. <br/>
          Mergi la Structură Curs și apasă pe "Flashcards" în dreptul unui material!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(deck => (
            <div key={deck.id} className="bg-white dark:bg-[#1a2230] p-5 rounded-xl border hover:border-indigo-500 transition-colors cursor-pointer group shadow-sm hover:shadow-md" onClick={() => startDeck(deck)}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">style</span>
                </div>
                <h3 className="font-bold line-clamp-2">{deck.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{fontSize:'16px'}}>auto_awesome_mosaic</span>
                {deck.cards ? deck.cards.length : 0} cartonașe
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                Generat la: {new Date(deck.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
