import DropdownPrimitive from './DropdownPrimitive';
import iconVerticalEllipsis from '@assets/img/icons/icon-vertical-ellipsis.svg';
import DialogPrimitive from './DialogPrimitive';
import { useState } from 'react';

const Header = () => {
  const [open, setOpen] = useState(false);
  const onEditBoard = () => {
    setOpen(true);
  };

  const onDeleteBoard = () => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      console.log('Delete');
    }
  };

  return (
    <header className="flex h-24.25 shrink-0 items-center">
      <div className="flex w-75 items-center gap-4 self-stretch border-b border-r border-lines-light pl-8 text-[32px] font-bold">
        kanban
      </div>
      <div className="flex flex-1 items-center justify-between self-stretch border-b border-r border-lines-light pl-8 pr-8 text-[32px] font-bold">
        <h2 className="--text-heading-xl">Platform Launch</h2>
        <DropdownPrimitive
          items={{
            edit: { label: 'Edit Board', onClick: onEditBoard },
            Delete: {
              label: 'Delete Board',
              onClick: onDeleteBoard,
            },
          }}
          triggerComponent={() => (
            <button className="flex items-center gap-2 text-[14px] font-bold text-main-purple">
              <img src={iconVerticalEllipsis} alt="icon vertical ellipsis" />
            </button>
          )}
        />
      </div>
      <DialogPrimitive isOpen={open} setOpen={setOpen} title="Edit Board">
        Hello World!
      </DialogPrimitive>
    </header>
  );
};
export default Header;
