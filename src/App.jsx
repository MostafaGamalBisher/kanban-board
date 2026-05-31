import { useState } from 'react';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import Workspace from './components/Workspace';
import { DataContext } from './Datacontext';

function App() {
  const [dataState, setDataState] = useState([]);
  const [selectedBoardIndex, setSelectedBoardIndex] = useState(0);

  return (
    <DataContext.Provider value={{ data: dataState, setData: setDataState }}>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <SideMenu
            selectedBoardIndex={selectedBoardIndex}
            setSelectedBoardIndex={setSelectedBoardIndex}
          />
          <Workspace columns={dataState[selectedBoardIndex]?.columns} />
        </div>
      </div>
    </DataContext.Provider>
  );
}

export default App;
