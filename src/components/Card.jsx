/**
 *
 * @param {Object} props
 * @param {string} props.title - The title of the card.
 * @returns  {JSX.Element} - A React component that renders a card with a title. The card is styled with a white background, rounded corners, and a shadow effect.
 * Each card is designed to be a draggable item within a column in a kanban board application.
 */

const Card = ({ title }) => {
  return (
    <div className="group/card relative min-h-16 overflow-hidden rounded-lg bg-white px-4 py-3 shadow-sm">
      <h2 className="text-heading-m">{title}</h2>
    </div>
  );
};

export default Card;
