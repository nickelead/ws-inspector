import React from 'react';
import Panel from 'react-flex-panel';
import { ControlPanel } from './ControlPanel/ControlPanel';
import FrameList from './FrameTable/FrameTable';
import PanelView from './PanelView/PanelView';
import './App.scss';
import { useRootStoreContextHook } from '../stores/RootStore';
import { useObservable, useObserver, Observer } from 'mobx-react-lite';
import { Provider } from 'mobx-react';

export default function App() {
  const { frameStore, controlStore } = useRootStoreContextHook();
  return useObserver(() => {
    const { activeFrame } = frameStore;
    return (
      <Panel cols className="App">
        <Panel size={330} minSize={180} resizable className="LeftPanel">
          <Observer>
            {() => <ControlPanel controlStore={controlStore}/>}
          </Observer>
        </Panel>
        <Panel minSize={100} className="PanelView"></Panel>
      </Panel>
    );
  });
}

/*<ControlPanel />*/
/*<FrameList />*/

/*{activeFrame != null ? (
  <PanelView frame={activeFrame} />
) : (
  <span className="message">Select a frame to view its contents</span>
)}*/
//{'Filter regexp'}