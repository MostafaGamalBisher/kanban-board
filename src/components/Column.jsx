import Card from './Card';

/**
 *
 * @param {Object} props
 * @param {string} props.title - The title of the column.
 * @param {Array} props.tasks - An array of task objects, where each object has the following structure:
 * @param {string} props.tasks[].id - The unique identifier for the task.
 * @param {string} props.tasks[].title - The title of the task.
 * @returns  {JSX.Element} - A React component that renders a column with a title, a list of tasks, and a button to add new tasks. Each task is rendered as a Card component.
 */

const Column = ({ title, tasks }) => {
  return (
    <div className="bg-lines-light flex w-72 shrink-0 flex-col self-start rounded-lg px-2">
      <h2 className="group/column bg-lines-light text-heading-s relative top-0 rounded px-2 py-4">
        {title} ({tasks.length})
      </h2>
      <div className="mb-5 flex flex-col gap-5">
        {tasks.map((item) => (
          <Card key={item.id} title={item.title} />
        ))}
      </div>
      <button className="border-light-grey bg-lines-light text-heading-m text-medium-grey mx-2 mt-auto border-t px-2 py-4">
        + Add New Task
      </button>
    </div>
  );
};

export default Column;
