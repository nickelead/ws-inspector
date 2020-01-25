/* eslint max-classes-per-file: 0 */
import React, { MouseEvent } from 'react';
import cx from 'classnames';
import FontAwesome from 'react-fontawesome';
import { checkViable, getName, TimeStamp } from '../Helpers/Helper';
import './FrameTable.scss';
import { EFilter, IFrame } from '../types';

type FrameListProps = {
  frames: IFrame[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
};

export default class FrameList extends React.Component<FrameListProps & EFilter> {
  handlerClearSelect = () => {
    this.props.onSelect(null);
  };

  render() {
    const { frames, activeId, onSelect, ...filterData } = this.props;
    return (
      <ul className="frame-list" onClick={this.handlerClearSelect}>
        {frames.map((frame) => (
          <FrameEntry
            key={frame.id}
            frame={frame}
            selected={frame.id === activeId}
            onSelect={onSelect}
            filterData={filterData as EFilter}
          />
        ))}
      </ul>
    );
  }
}

type FrameEntryProps = {
  key: number;
  frame: IFrame;
  selected: boolean;
  onSelect: (id: number | null) => void;
  filterData: EFilter;
};

class FrameEntry extends React.PureComponent<FrameEntryProps> {
  handlerSelect = (e: MouseEvent) => {
    e.stopPropagation();
    this.props.onSelect(this.props.frame.id);
  };

  render() {
    const { frame, selected, filterData } = this.props;
    if (checkViable(frame, filterData as EFilter)) return null;
    return (
      <li
        className={cx('frame', `frame-${frame.type}`, { 'frame-selected': selected })}
        onClick={this.handlerSelect}
      >
        <FontAwesome name={frame.type === 'incoming' ? 'arrow-circle-down' : 'arrow-circle-up'} />
        <span className="timestamp">{TimeStamp(frame.time)}</span>
        <span className="name">{getName(frame, filterData)}</span>
        <span className="length">{frame.length}</span>
      </li>
    );
  }
}
