import './Card.css';

interface CardProps {
  id: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ id, image, isFlipped, isMatched, onClick }) => {
  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={onClick}>
      <div className="card-inner">
        <div className="card-front">
          <img src={image} alt={`Card ${id}`} />
        </div>
        <div className="card-back">
          <div className="card-back-content">?</div>
        </div>
      </div>
    </div>
  );
};

export default Card;
