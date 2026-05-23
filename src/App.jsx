import DropdownPrimitive from './components/DropdownPrimitive';
import Button from '@components/Button';

function App() {
  return (
    <div>
      <DropdownPrimitive
        items={{
          edit: {
            label: 'Delete',
            onClick: () => console.log('Delete'),
          },
        }}
        triggerComponent={() => <Button variant="secondary">Actions</Button>}
      />
    </div>
  );
}

export default App;
