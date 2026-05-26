import Column from './Column';

/**
 *
 * @param {Object} props
 * @param {Array} props.columns - An array of column objects, where each object has the following structure:
 * @param {Object} props.columns[].id - The unique identifier for the column.
 * @param {Array} props.columns[].title - The title of the column.
 * @param {string} props.columns[].tasks - An array of task objects, where each object has the following structure:
 * @returns {JSX.Element}
 */

const Workspace = ({ columns = [] }) => {
  return (
    <div className="bg-light-grey flex h-[calc(100vh-97px)] flex-1 gap-6 overflow-auto p-6">
      {columns.map((item) => (
        <Column key={item.id} title={item.title} tasks={item.tasks} />
      ))}
      <button className="bg-lines-light text-heading-l text-medium-grey w-72 shrink-0 self-start rounded-md p-3">
        + New Column
      </button>
    </div>
  );
};

export default Workspace;
