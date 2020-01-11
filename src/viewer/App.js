import React from 'react';
import Panel from 'react-flex-panel';
import ListControls from "./ListControls/ListControls";
import FrameList from "./FrameTable/FrameTable";
import FrameView from "./PanelView/PanelView";
import {stringToBuffer} from "./Helpers/Helper"
import './App.scss';


export default class App extends React.Component {
    _uniqueId = 0;
    _issueTime = null;
    _issueWallTime = null;
    cacheKey = ['isCapturing', 'regName', 'filter', 'isFilterInverse'];

    constructor(props) {
        super(props);
        props.handlers['Network.webSocketFrameReceived'] = this.webSocketFrameReceived.bind(this);
        props.handlers['Network.webSocketFrameSent'] = this.webSocketFrameSent.bind(this);
        this.state = {frames: [], activeId: null, isCapturing: true, regName: '', filter: '', isFilterInverse: false};
    }

    componentDidMount() {
        const cacheState = this.cacheKey.reduce((acc, key) => {
            const value = localStorage.getItem(key);
            if (value !== null && value !== undefined) {
                acc[key] = value
            }
            return acc
        }, {});
        this.setState(cacheState)
// TODO Boolean values turns to strings.
    }

    componentDidUpdate(prevProps, prevState) {
        this.cacheKey.forEach(key => {
            if (prevState[key] !== this.state[key]) {
                localStorage.setItem(key, this.state[key])
            }
        })
    }

    getTime(timestamp) {
        if (this._issueTime == null) {
            this._issueTime = timestamp;
            this._issueWallTime = new Date().getTime();
        }
        return new Date((timestamp - this._issueTime) * 1000 + this._issueWallTime);
    }

    render() {
        const {frames, activeId, regName, filter, isFilterInverse, isCapturing} = this.state;
        const active = frames.find(f => f.id === activeId);
        return (
            <Panel cols className="App">
                <Panel size={330} minSize={180} resizable className="LeftPanel">
                    <ListControls
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
                    {active != null ? <FrameView frame={active}/> :
                        <span className="message">Select a frame to view its contents</span>}
                </Panel>
            </Panel>
        );
    }

    selectFrame = id => {
        this.setState({activeId: id});
    };

    clearFrames = () => {
        this.setState({frames: []});
    };

    onCapturingToggle = () => {
        this.setState({isCapturing: !this.state.isCapturing});
    }

    setRegName = e => {
        this.setState({regName: e.target.value});
    };
    setFilter = e => {
        this.setState({filter: e.target.value});
    };

    onFilterModeToggle = () => {
        this.setState({isFilterInverse: !this.state.isFilterInverse})
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
            this.setState(({frames}) => ({frames: [...frames, frame]}));
        }
    }

    webSocketFrameReceived({timestamp, response}) {
        if (this.state.isCapturing === true || this.state.isCapturing === 'true' ) {// see componentDidMount()
            this.addFrame('incoming', timestamp, response);
        }
    }

    webSocketFrameSent({timestamp, response}) {
        if (this.state.isCapturing === true || this.state.isCapturing === 'true' ) {// see componentDidMount()
            this.addFrame('outgoing', timestamp, response);
        }
    }
}
