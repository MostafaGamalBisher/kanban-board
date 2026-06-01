import TextField from './TextField';
import iconCross from '../assets/img/icons/icon-cross.svg';
import Button from './Button';
import { useContext, useState } from 'react';
import { DataContext } from '../Datacontext';

const AddNewBoardForm = ({ boardId }) => {
  const { setData } = useContext(DataContext);
  const [columnsArray, setColumnsArray] = useState([
    {
      id: Date.now(),
    },
  ]);

  const removeColumnHandler = (id) => {
    setColumnsArray((prev) => prev.filter((column) => column.id !== id));
  };

  const addNewColumnHandler = () => {
    setColumnsArray((prev) => [...prev, { id: Date.now() }]);
  };

  const createNewColumnsArray = (formData, columnsArray) => {
    return columnsArray.map((column) => {
      return {
        id: column.id,
        title: formData.get(column.id),
        tasks: [],
      };
    });
  };

  const updateData = (boardName, newColumnsArray, setData) => {
    setData((prev) => {
      return [
        ...prev,
        {
          id: Date.now(),
          title: boardName,
          columns: newColumnsArray,
        },
      ];
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const boardName = formData.get('boardName');
    const NewColumnsArray = createNewColumnsArray(
      formData,
      columnsArray,
      boardId
    );

    updateData(boardName, NewColumnsArray, setData);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <h3 className="text-body-m text-medium-grey pt-6 pb-2">Name</h3>
        <TextField placeholder="e.g Web Design" name="boardName" required />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-body-m text-medium-grey pt-6">Columns</h3>
        {columnsArray.map((obj) => (
          <div key={obj.id} className="flex items-center gap-4">
            <TextField
              placeholder="e.g Web Design"
              name={obj.id}
              defaultValue={obj.title}
              required
            />
            <button type="button" onClick={() => removeColumnHandler(obj.id)}>
              <img src={iconCross} alt="icon cross" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addNewColumnHandler}
        >
          + Add New Column
        </Button>
        <div className="mt-6">
          <Button type="submit" variant="primary" size="sm" isFullWidth>
            Create New Board
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddNewBoardForm;
