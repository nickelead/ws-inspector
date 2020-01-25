import React, { ChangeEvent } from 'react';
import Panel from 'react-flex-panel';
import ControlPanel from './ControlPanel/ControlPanel';
import FrameList from './FrameTable/FrameTable';
import PanelView from './PanelView/PanelView';
import { stringToBuffer } from './Helpers/Helper';
import './App.scss';
import { IFrame, IFrameType, Response } from './types';

interface AppProps {
  handlers: any;
}
interface AppState {
  [key: string]: any;
  frames: IFrame[];
  activeId: number | null;
  isCapturing: boolean;
  regName: string;
  filter: string;
  isFilterInverse: boolean;
}
export default class App extends React.Component<AppProps, AppState> {
  frameUniqueId = 0;

  frameIssueTime: number;

  frameIssueWallTime: number;

  cacheKey = ['isCapturing', 'regName', 'filter', 'isFilterInverse'];

  constructor(props: AppProps) {
    super(props);
    this.props.handlers['Network.webSocketFrameReceived'] = this.webSocketFrameReceived.bind(this);
    this.props.handlers['Network.webSocketFrameSent'] = this.webSocketFrameSent.bind(this);
    this.state = {
      frames: [],
      activeId: null,
      isCapturing: true,
      regName: '',
      filter: '',
      isFilterInverse: false,
    };
  }

  componentDidMount() {
    const cacheState = this.cacheKey.reduce<Record<string, string | boolean>>((acc, key) => {
      const value = window.localStorage.getItem(key);
      if (value !== null && value !== undefined) {
        acc[key] = value;
        if (value === 'true') {
          acc[key] = true;
        }
        if (value === 'false') {
          acc[key] = false;
        }
      }
      return acc;
    }, {});
    this.setState(cacheState);
    // TODO Boolean values turns to strings.
  }

  componentDidUpdate(prevProps: AppProps, prevState: AppState) {
    this.cacheKey.forEach((key) => {
      if (prevState[key] !== this.state[key]) {
        localStorage.setItem(key, this.state[key]);
      }
    });
  }

  getTime(timestamp: number) {
    if (this.frameIssueTime == null) {
      this.frameIssueTime = timestamp;
      this.frameIssueWallTime = new Date().getTime();
    }
    return new Date((timestamp - this.frameIssueTime) * 1000 + this.frameIssueWallTime);
  }

  render() {
    const { frames, activeId, regName, filter, isFilterInverse, isCapturing } = this.state;
    const active = frames.find((f) => f.id === activeId);
    return (
      <Panel cols className="App">
        <Panel size={330} minSize={180} resizable className="LeftPanel">
          <ControlPanel
            onClear={this.clearFrames}
            onCapturingToggle={this.onCapturingToggle}
            isCapturing={isCapturing}
            regName={regName}
            onRegName={this.setRegName}
            filter={filter}
            onFilter={this.setFilter}
            isFilterInverse={this.state.isFilterInverse}
            onFilterModeToggle={this.onFilterModeToggle}
          />
          <FrameList
            frames={frames}
            activeId={activeId}
            onSelect={this.selectFrame}
            regName={regName}
            filter={filter}
            isFilterInverse={isFilterInverse}
          />
        </Panel>
        <Panel minSize={100} className="PanelView">
          {active != null ? (
            <PanelView frame={active} />
          ) : (
            <span className="message">Select a frame to view its contents</span>
          )}
        </Panel>
      </Panel>
    );
  }

  selectFrame = (id: number) => {
    this.setState({ activeId: id });
  };

  clearFrames = () => {
    this.setState({ frames: [] });
  };

  onCapturingToggle = () => {
    this.setState({ isCapturing: !this.state.isCapturing });
  };

  setRegName = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ regName: e.target.value });
  };

  setFilter = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ filter: e.target.value });
  };

  onFilterModeToggle = () => {
    this.setState({ isFilterInverse: !this.state.isFilterInverse });
  };

  addFrame(type: IFrameType, timestamp: number, response: Response) {
    if (response.opcode === 1 || response.opcode === 2) {
      const frame: IFrame = {
        type,
        name: type,
        id: this.frameUniqueId,
        time: this.getTime(timestamp),
        length: response.payloadData.length,
      };
      this.frameUniqueId += 1;
      if (response.opcode === 1) {
        frame.text = response.payloadData;
      } else {
        frame.binary = stringToBuffer(response.payloadData);
      }
      this.setState(({ frames }) => ({ frames: [...frames, frame] }));
    }
  }

  webSocketFrameReceived({ timestamp, response }: { timestamp: number; response: Response }) {
    if (this.state.isCapturing) {
      this.addFrame('incoming', timestamp, response);
    }
  }

  webSocketFrameSent({ timestamp, response }: { timestamp: number; response: Response }) {
    if (this.state.isCapturing) {
      this.addFrame('outgoing', timestamp, response);
    }
  }
}
