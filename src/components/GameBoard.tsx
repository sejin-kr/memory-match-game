import { useState, useEffect } from 'react';
import Card from './Card';
import './GameBoard.css';

// 이미지 import
import card1 from '../assets/imgs/card_01.png';
import card2 from '../assets/imgs/card_02.png';
import card3 from '../assets/imgs/card_03.png';
import card4 from '../assets/imgs/card_04.png';
import card5 from '../assets/imgs/card_05.png';
import card6 from '../assets/imgs/card_06.png';
import card7 from '../assets/imgs/card_07.png';
import card8 from '../assets/imgs/card_08.png';
import card9 from '../assets/imgs/card_09.png';
import card10 from '../assets/imgs/card_10.png';
import card11 from '../assets/imgs/card_11.png';
import card12 from '../assets/imgs/card_12.png';
import card13 from '../assets/imgs/card_13.png';
import card14 from '../assets/imgs/card_14.png';

interface CardData {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface RankingData {
  nickname: string;
  totalMoves: number;
  date: string;
}

const DIFFICULTY_LEVELS = [
  { name: '1단계', time: 20, cards: 6 },
  { name: '2단계', time: 25, cards: 8 },
  { name: '3단계', time: 30, cards: 10 },
  { name: '4단계', time: 35, cards: 12 },
  { name: '5단계', time: 35, cards: 14 },
];

const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].time);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [totalMoves, setTotalMoves] = useState(0);
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [showRankings, setShowRankings] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showNicknamePopup, setShowNicknamePopup] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showLastPlaceMessage, setShowLastPlaceMessage] = useState(false);

  // 카드 이미지 배열
  const cardImages = [
    card1,
    card2,
    card3,
    card4,
    card5,
    card6,
    card7,
    card8,
    card9,
    card10,
    card11,
    card12,
    card13,
    card14,
  ];

  // 랭킹 데이터 로드
  useEffect(() => {
    const savedRankings = localStorage.getItem('memoryGameRankings');
    if (savedRankings) {
      setRankings(JSON.parse(savedRankings));
    }
  }, []);

  // 게임 초기화
  useEffect(() => {
    if (nickname && !showNicknamePopup) {
      initializeGame();
    }
  }, [difficulty, nickname, showNicknamePopup]);

  // 타이머 설정
  useEffect(() => {
    let timer: number;
    if (isGameStarted && !isGameOver && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleGameOver(false);
    }
    return () => clearInterval(timer);
  }, [isGameStarted, isGameOver, timeLeft]);

  const initializeGame = () => {
    const currentLevel = DIFFICULTY_LEVELS[difficulty];
    const selectedImages = cardImages.slice(0, currentLevel.cards / 2);
    const gameCards = [...selectedImages, ...selectedImages]
      .sort(() => Math.random() - 0.5)
      .map((image, index) => ({
        id: index,
        image,
        isFlipped: true,
        isMatched: false,
      }));

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setTimeLeft(currentLevel.time);
    setIsGameStarted(false);
    setIsGameOver(false);

    // 1.5초 후 카드 뒤집기 (속도 증가)
    setTimeout(() => {
      setCards((prevCards) => prevCards.map((card) => ({ ...card, isFlipped: false })));
      setIsGameStarted(true);
    }, 1500);
  };

  const handleGameOver = (isSuccess: boolean) => {
    setIsGameOver(true);
    if (isSuccess) {
      const newTotalMoves = totalMoves + moves;
      setTotalMoves(newTotalMoves);

      if (difficulty === DIFFICULTY_LEVELS.length - 1) {
        // 게임 완료 - 랭킹 저장
        const newRanking = {
          nickname,
          totalMoves: newTotalMoves,
          date: new Date().toLocaleDateString(),
        };
        const newRankings = [...rankings, newRanking]
          .sort((a, b) => a.totalMoves - b.totalMoves)
          .slice(0, 5);
        setRankings(newRankings);
        localStorage.setItem('memoryGameRankings', JSON.stringify(newRankings));

        // 1등 체크
        if (newRankings[0].nickname === nickname) {
          setShowFireworks(true);
          setTimeout(() => setShowFireworks(false), 5000);
        }

        // 꼴지 체크
        if (newRankings[newRankings.length - 1].nickname === nickname) {
          setShowLastPlaceMessage(true);
          setTimeout(() => setShowLastPlaceMessage(false), 3000);
        }
      }
    }
  };

  const handleNextLevel = () => {
    if (difficulty < DIFFICULTY_LEVELS.length - 1) {
      setDifficulty((prev) => prev + 1);
    }
  };

  const handleCardClick = (clickedId: number) => {
    if (!nickname || !isGameStarted || isGameOver) return;
    if (flippedCards.length === 2) return;
    if (cards[clickedId].isMatched) return;
    if (flippedCards.includes(clickedId)) return;

    const newFlippedCards = [...flippedCards, clickedId];
    setFlippedCards(newFlippedCards);

    const newCards = cards.map((card) =>
      card.id === clickedId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstId, secondId] = newFlippedCards;

      if (cards[firstId].image === cards[secondId].image) {
        // 매치 성공
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card
            )
          );
          setFlippedCards([]);

          // 모든 카드가 매치되었는지 확인
          const allMatched = newCards.every(
            (card) => card.id === firstId || card.id === secondId || card.isMatched
          );
          if (allMatched) {
            handleGameOver(true);
          }
        }, 300); // 속도 증가
      } else {
        // 매치 실패
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 300); // 속도 증가
      }
    }
  };

  const handleDifficultyChange = (level: number) => {
    if (!nickname) {
      setShowNicknamePopup(true);
      return;
    }
    setDifficulty(level);
    setTotalMoves(0);
  };

  const resetGame = () => {
    if (!nickname) {
      setShowNicknamePopup(true);
      return;
    }
    setDifficulty(0);
    setTotalMoves(0);
    initializeGame();
  };

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      setShowNicknamePopup(false);
    }
  };

  return (
    <div className="game-board">
      {showNicknamePopup && (
        <div className="nickname-popup">
          <div className="nickname-content">
            <h2>닉네임을 입력해주세요</h2>
            <form onSubmit={handleNicknameSubmit}>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                maxLength={10}
                required
              />
              <button type="submit">시작하기</button>
            </form>
          </div>
        </div>
      )}
      <div className="game-info">
        <div className="difficulty-selector">
          <h3>난이도 선택</h3>
          <div className="difficulty-buttons">
            {DIFFICULTY_LEVELS.map((level, index) => (
              <button
                key={index}
                className={difficulty === index ? 'active' : ''}
                onClick={() => handleDifficultyChange(index)}>
                {level.name}
              </button>
            ))}
          </div>
        </div>
        <h2>현재 단계: {DIFFICULTY_LEVELS[difficulty].name}</h2>
        <div className="game-count-text">
          <h2>이동 횟수: {moves}</h2>
          <h2>총 이동 횟수: {totalMoves}</h2>
        </div>
        <h2>남은 시간: {timeLeft}초</h2>
        <div className="game-controls">
          {!isGameOver && <button onClick={initializeGame}>게임 재시작</button>}
          <button onClick={() => setShowRankings(!showRankings)}>
            {showRankings ? '랭킹 닫기' : '랭킹 보기'}
          </button>
        </div>
      </div>
      <div className="cards-container">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            image={card.image}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
      {isGameOver && (
        <div className="game-over-popup">
          <div className="game-over-content">
            <h2>{timeLeft === 0 ? '시간 초과! 💣' : '성공! 🎉'}</h2>
            <p>현재 단계 이동 횟수: {moves}</p>
            <p>총 이동 횟수: {totalMoves}</p>
            {timeLeft > 0 && difficulty < DIFFICULTY_LEVELS.length - 1 ? (
              <button onClick={handleNextLevel}>다음 단계</button>
            ) : (
              <button onClick={resetGame}>처음부터 다시 시작</button>
            )}
          </div>
        </div>
      )}
      {showRankings && (
        <div className="rankings-popup">
          <div className="rankings-content">
            <h2>🏆 랭킹 🏆</h2>
            {rankings.length > 0 ? (
              <div className="rankings-list">
                {rankings.map((rank, index) => (
                  <div key={index} className="ranking-item">
                    <span className="rank-number">{index + 1}위</span>
                    <span className="rank-nickname">{rank.nickname}</span>
                    <span className="rank-moves">{rank.totalMoves}회</span>
                    <span className="rank-date">{rank.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>아직 기록이 없습니다.</p>
            )}
            <button onClick={() => setShowRankings(false)}>닫기</button>
          </div>
        </div>
      )}
      {showFireworks && (
        <div className="fireworks">
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
        </div>
      )}
      {showLastPlaceMessage && (
        <div className="last-place-message">
          <h2>분발하세요! 😈</h2>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
