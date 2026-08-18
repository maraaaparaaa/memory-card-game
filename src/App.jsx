import { useState, useEffect } from 'react';
import CardGrid from "./components/CardGrid.jsx";
import Scoreboard from './components/Scoreboard.jsx';
import './App.css';

function App() {
  const [cards, setCards] = useState([]);
  const [clickedIds, setClickedIds] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('bestScore');
    return saved !== null ? Number(saved) : 0;
  });
  const [isLoading, setIsLoading] = useState(false);

  function getRandomIds(count, max){
    const ids = new Set();
    while(ids.size < count){
      const randomId = Math.floor(Math.random() * max) + 1;
      ids.add(randomId);
    }
    return [...ids];
  }

  useEffect(() => {

    async function fetchOneCard(id) {
      const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
      const data = await res.json();

      return {
        id: data.id,
        name: data.name,
        image: data.image,
      };
    }

    async function fetchCards() {
      setIsLoading(true);

      const ids = getRandomIds(12, 151);
      const promises = ids.map(id => fetchOneCard(id));
      const results = await Promise.all(promises);
      setCards(results);

      setIsLoading(false);
    }

    fetchCards();
  }, []);

  function shuffleCards() {
    //  Fisher-Yates Algorithm
    setCards((prevCards) => {
      const shuffled = [...prevCards];

      for (let i= shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let aux = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = aux;
      }
      return shuffled;
    });
  }

  function handleCardClick(id) {
    if(clickedIds.includes(id)){
      setScore(0);
      setClickedIds([]);
    }
    else {
      const newScore = score + 1;
      setScore(newScore);
      if(newScore > bestScore){
        setBestScore(newScore);
      }
      setClickedIds([...clickedIds, id]);
    }
    shuffleCards();
  }

  useEffect(() => {
    localStorage.setItem('bestScore', JSON.stringify(bestScore));
  }, [bestScore]);

  return (
      <div className="app">
        <h1>Memory Card</h1>
        <Scoreboard score={score} bestScore={bestScore} />
        {
          isLoading? (<p>Loading...</p>
          ) : (
              <CardGrid cards = {cards} onCardClick={handleCardClick} />)
        }
      </div>
  );
}

export default App;