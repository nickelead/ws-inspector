import React from 'react';
import Panel from 'react-flex-panel';
import FontAwesome from 'react-fontawesome';
import cx from 'classnames';
import HexViewer from './HexViewer';
import { ObjectInspector } from 'react-inspector';

import './App.scss';

const padded = (num, d) => num.toFixed(0).padStart(d, '0');

const stringToBuffer = str => {
  const ui8 = new Uint8Array(str.length);
  for (let i = 0; i < str.length; ++i) {
    ui8[i] = str.charCodeAt(i);
  }
  return ui8;
};

const TimeStamp = ({ time }) => {
  const h = time.getHours();
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  return (
    <span className="timestamp">
      {padded(h, 2)}:{padded(m, 2)}:{padded(s, 2)}.{padded(ms, 3)}
    </span>
  );
};

class ListControls extends React.Component {
  state = {
    openInput: null // 'filter' | 'name'
  };

  openNameReg = () => {
    if (this.state.openInput === 'name') {
      this.setState({ openInput: null });
    } else {
      this.setState({ openInput: 'name' });
    }
  };

  render() {
    const { onClear, onStart, onStop, regName, onRegName, capturing } = this.props;
    return (
      <div className="list-controls">
        {capturing ? (
          <span className="list-button record active" onClick={onStop} title="Stop" />
        ) : (
          <span className="list-button record" onClick={onStart} title="Start" />
        )}
        <FontAwesome className="list-button" name="ban" onClick={onClear} title="Clear" />
        <span className={'separator'} />
        <FontAwesome
          className={cx('list-button', {
            active: !!regName
          })}
          name="file-signature"
          onClick={this.openNameReg}
          title="Clear"
        />
        <div
          className={cx('input-wrap', {
            hide: this.state.openInput !== 'name'
          })}
        >
          <input
            className={'input'}
            name={'reg-name'}
            placeholder={'Name regexp:  type=".+"'}
            value={regName}
            onChange={onRegName}
          />
        </div>
      </div>
    );
  }
}

class FrameList extends React.Component {
  render() {
    const { frames, activeId, onSelect, regName } = this.props;
    return (
      <ul className="frame-list" onClick={() => onSelect(null)}>
        {frames.map(frame => (
          <FrameEntry key={frame.id} frame={frame} selected={frame.id === activeId} regName={regName} onSelect={onSelect} />
        ))}
      </ul>
    );
  }
}

class FrameEntry extends React.Component {
  handlerSelect = () => {
    this.props.onSelect(this.props.frame.id);
  };

  getName() {
    const { frame, regName } = this.props;
    if (frame.text != null) {
      debugger;
      if (regName) {
        try {
          let matchAll = frame.text.matchAll(regexp);

          debugger;
          matchAll = Array.from(matchAll); // теп
          const firstMach = matchAll[0][1] || matchAll[0][0];
          if (firstMach) {
            return firstMach;
          }
        } catch (e) {}
      }
      return 'Text Frame';
    } else {
      return 'Binary Frame';
    }
  }

  render() {
    let { frame, selected } = this.props;

    return (
      <li className={cx('frame', 'frame-' + frame.type, { 'frame-selected': selected })} onClick={this.handlerSelect}>
        <FontAwesome name={frame.type === 'incoming' ? 'arrow-circle-down' : 'arrow-circle-up'} />
        <TimeStamp time={frame.time} />
        <span className="name">{this.getName()}</span>
        <span className="length">{frame.length}</span>
      </li>
    );
  }
}

const TextViewer = ({ data }) => <div className="TextViewer tab-pane">{data}</div>;

const JsonViewer = ({ data }) => (
  <div className="JsonViewer tab-pane">
    <ObjectInspector data={data} />
  </div>
);

class FrameView extends React.Component {
  state = { panel: null };

  makePanel(name, title) {
    return (
      <li className={cx('tab-button', { active: this.state.panel === name })} onClick={() => this.setState({ panel: name })}>
        {title}
      </li>
    );
  }

  static getDerivedStateFromProps(props, state) {
    const { frame } = props;
    const panels = [];
    if (frame.text != null) {
      panels.push('text');
      if (!frame.hasOwnProperty('json')) {
        try {
          frame.json = JSON.parse(frame.text);
        } catch {
          frame.json = undefined;
        }
      }
      if (frame.json !== undefined) {
        panels.push('json');
      }
    }
    if (frame.binary) {
      panels.push('hex');
    }
    if (!panels.includes(state.panel)) {
      return { panel: panels[0] };
    }
    return null;
  }

  render() {
    const { frame } = this.props;
    const { panel } = this.state;
    return (
      <div className="FrameView">
        <ul className="tab-line">
          {frame.text != null && this.makePanel('text', 'Text')}
          {frame.json !== undefined && this.makePanel('json', 'JSON')}
          {frame.binary != null && this.makePanel('hex', 'Hex')}
        </ul>
        {panel === 'text' && <TextViewer data={frame.text} />}
        {panel === 'json' && <JsonViewer data={frame.json} />}
        {panel === 'hex' && <HexViewer className="tab-pane" data={frame.binary} />}
      </div>
    );
  }
}

export default class App extends React.Component {
  _uniqueId = 0;
  _issueTime = null;
  _issueWallTime = null;

  getTime(timestamp) {
    if (this._issueTime == null) {
      this._issueTime = timestamp;
      this._issueWallTime = new Date().getTime();
    }
    return new Date((timestamp - this._issueTime) * 1000 + this._issueWallTime);
  }

  state = { frames: [], activeId: null, capturing: true, regName: '' };

  constructor(props) {
    super(props);

    props.handlers['Network.webSocketFrameReceived'] = this.webSocketFrameReceived.bind(this);
    props.handlers['Network.webSocketFrameSent'] = this.webSocketFrameSent.bind(this);
  }

  render() {
    const { frames, activeId, regName } = this.state;
    const active = frames.find(f => f.id === activeId);
    return (
      <Panel cols className="App">
        <Panel size={300} minSize={180} resizable className="LeftPanel">
          <ListControls
            onClear={this.clearFrames}
            onStart={this.startCapture}
            capturing={this.state.capturing}
            onStop={this.stopCapture}
            regName={regName}
            onRegName={this.setRegName}
          />
          <FrameList frames={frames} activeId={activeId} onSelect={this.selectFrame} regName={regName} />
        </Panel>
        <Panel minSize={100} className="PanelView">
          {active != null ? <FrameView frame={active} /> : <span className="message">Select a frame to view its contents</span>}
        </Panel>
      </Panel>
    );
  }

  selectFrame = id => {
    this.setState({ activeId: id });
  };

  clearFrames = () => {
    this.setState({ frames: [] });
  };

  startCapture = () => {
    this.setState({ capturing: true });
  };

  stopCapture = () => {
    this.setState({ capturing: false });
  };

  setRegName = e => {
    this.setState({ regName: e.target.value });
  };

  addFrame(type, timestamp, response) {
    if (response.opcode === 1 || response.opcode === 2) {
      const frame = {
        type,
        name: type,
        id: ++this._uniqueId,
        time: this.getTime(timestamp),
        length: response.payloadData.length
      };
      if (response.opcode === 1) {
        frame.text = response.payloadData;
      } else {
        frame.binary = stringToBuffer(response.payloadData);
      }
      this.setState(({ frames }) => ({ frames: [...frames, frame] }));
    }
  }

  webSocketFrameReceived({ timestamp, response }) {
    if (this.state.capturing === true) {
      this.addFrame('incoming', timestamp, response);
    }
  }

  webSocketFrameSent({ timestamp, response }) {
    if (this.state.capturing === true) {
      this.addFrame('outgoing', timestamp, response);
    }
  }
}
