import iconBoard from '../assets/img/icons/icon-board.svg';
import { useState } from 'react';
import DialogPrimitive from './DialogPrimitive';
import { cn } from '../utils/helpers';

const SideMenu = ({ data = [], selectedBoardIndex, setSelectedBoardIndex }) => {
  const [open, setOpen] = useState(false);
  return (
    <aside className="side-menu border-lines-light -mt-px w-75 border-r bg-white">
      <p className="text-heading-s px-8 py-4">ALL BOARDS ({data.length})</p>
      <ul>
        {data.map((item, index) => (
          <li key={item.id}>
            <button
              className={cn(
                'text-heading-m text-medium-grey data-[isactive=false]:hover:bg-main-purple/10 data-[isactive=false]:hover:text-main-purple flex w-11/12 items-center gap-4 rounded-e-full px-8 py-4 transition',
                {
                  'bg-main-purple hover:bg-main-purple text-white':
                    selectedBoardIndex === index,
                }
              )}
              data-isactive={selectedBoardIndex === index}
              onClick={() => setSelectedBoardIndex(index)}
            >
              <img src={iconBoard} alt="" />
              {item.title}
            </button>
          </li>
        ))}
        <li className="px-8 py-4">
          <DialogPrimitive
            isOpen={open}
            setOpen={setOpen}
            title="Create New Board"
            triggerComponent={
              <button className="text-heading-m text-main-purple flex w-full items-center gap-4">
                <img src={iconBoard} alt="" />+ Create New Board
              </button>
            }
          ></DialogPrimitive>
        </li>
      </ul>
    </aside>
  );
};

export default SideMenu;
