/* eslint max-classes-per-file: 0 */
import React from 'react';
import cx from 'classnames';
import FontAwesome from 'react-fontawesome';
import { grep, TimeStamp } from '../Helpers/Helper';
import './FrameTable.scss';
import { IFrame } from '../types';
type FrameListProps = { frames: IFrame[]; activeId; onSelect; regName; filter; isFilterInverse };
export default class FrameList extends React.Component<FrameListProps> {
  handlerClearSelect = () => {
    this.props.onSelect(null);
  };

  render() {
    const { frames, activeId, onSelect, regName, filter, isFilterInverse } = this.props;
    return (
      <ul className="frame-list" onClick={this.handlerClearSelect}>
        {frames.map((frame) => (
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
  handlerSelect = (e) => {
    e.stopPropagation();
    this.props.onSelect(this.props.frame.id);
  };

  getName() {
    const { frame, regName } = this.props;
    if (frame.text != null) {
      return grep(frame.text, regName) || frame.text;
    }
    return 'Binary Frame';
  }

  checkViable() {
    const { frame, filter, isFilterInverse } = this.props;
    if (filter) {
      if (isFilterInverse) {
        return !!grep(frame.text, filter);
      }
      return !grep(frame.text, filter);
    }
    return false;
  }

  render() {
    const { frame, selected } = this.props;
    if (this.checkViable()) return null;
    return (
      <li
        className={cx('frame', `frame-${frame.type}`, { 'frame-selected': selected })}
        onClick={this.handlerSelect}
      >
        <FontAwesome name={frame.type === 'incoming' ? 'arrow-circle-down' : 'arrow-circle-up'} />
        <span className="timestamp">{TimeStamp(frame.time)}</span>
        <span className="name">{this.getName()}</span>
        <span className="length">{frame.length}</span>
      </li>
    );
  }
}
