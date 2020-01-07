import React from 'react';
import {grep, TimeStamp} from "./Helper";
import cx from "classnames";
import FontAwesome from "react-fontawesome";
import './FrameList.scss';

export default class FrameList extends React.Component {
    handlerClearSelect = () => {
        this.props.onSelect(null);
    };

    render() {
        const {frames, activeId, onSelect, regName, filter, isFilterInverse} = this.props;
        return (
            <ul className="frame-list" onClick={this.handlerClearSelect}>
                {frames.map(frame => (
                    <FrameEntry
                        key={frame.id}
                        frame={frame}
                        selected={frame.id === activeId}
                        regName={regName}
                        onSelect={onSelect}
                        filter={filter}
                        isFilterInverse={isFilterInverse}
                    />
                ))}
            </ul>
        );
    }
}

class FrameEntry extends React.PureComponent {
    handlerSelect = e => {
        e.stopPropagation();
        this.props.onSelect(this.props.frame.id);
    };

    getName() {
        const {frame, regName} = this.props;
        if (frame.text != null) {
            return grep(frame.text, regName) || frame.text;
        } else {
            return 'Binary Frame';
        }
    }

    checkViable() {
        const {frame, filter, isFilterInverse} = this.props;
        if (filter) {
            if (isFilterInverse) {
                return !!grep(frame.text, filter);
            } else {
                return !grep(frame.text, filter);
            }

        }
    }

    render() {
        let {frame, selected} = this.props;
        if (this.checkViable()) return null;
        return (
            <li className={cx('frame', 'frame-' + frame.type, {'frame-selected': selected})}
                onClick={this.handlerSelect}>
                <FontAwesome name={frame.type === 'incoming' ? 'arrow-circle-down' : 'arrow-circle-up'}/>
                <span className="timestamp">{TimeStamp(frame.time)}</span>
                <span className="name">{this.getName()}</span>
                <span className="length">{frame.length}</span>
            </li>
        );
    }
}
