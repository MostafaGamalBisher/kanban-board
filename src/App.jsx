import { useState } from 'react';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import Workspace from './components/Workspace';
import data from './data.json';

function App() {
  const [dataState, setDataState] = useState(data);
  const [selectedBoardIndex, setSelectedBoardIndex] = useState(0);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <SideMenu
          data={dataState}
          selectedBoardIndex={selectedBoardIndex}
          setSelectedBoardIndex={setSelectedBoardIndex}
        />
        <Workspace columns={dataState[selectedBoardIndex]?.columns} />
      </div>
    </div>
  );
}

export default App;
