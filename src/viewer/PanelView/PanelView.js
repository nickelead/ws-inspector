import { ObjectInspector } from 'react-inspector';
import React from 'react';
import cx from 'classnames';
import HexViewer from './HexViewer';
import './PanelView.scss';

const TextViewer = ({ data }) => <div className="TextViewer tab-pane">{data}</div>;

const JsonViewer = ({ data }) => (
  <div className="JsonViewer tab-pane">
    <ObjectInspector data={data} expandLevel={1} />
  </div>
);

export default class FrameView extends React.Component {
    state = { panel: null };

    static getDerivedStateFromProps(props, state) {
      const { frame } = props;
      const panels = [];
      if (frame.binary) {
        panels.push('hex');
      }

      if (frame.text != null) {
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

        panels.push('text');
      }

      if (!panels.includes(state.panel)) {
        return { panel: panels[0] };
      }
      return null;
    }

    makePanel(name, title) {
      return (
        <li
          className={cx('tab-button', { active: this.state.panel === name })}
          onClick={() => this.setState({ panel: name })}
        >
          {title}
        </li>
      );
    }

    render() {
      const { frame } = this.props;
      const { panel } = this.state;
      return (
        <div className="FrameView">
          <ul className="tab-line">

            {frame.json !== undefined && this.makePanel('json', 'JSON')}
            {frame.binary != null && this.makePanel('hex', 'Hex')}
            {frame.text != null && this.makePanel('text', 'Text')}
          </ul>
          {panel === 'text' && <TextViewer data={frame.text} />}
          {panel === 'json' && <JsonViewer data={frame.json} />}
          {panel === 'hex' && <HexViewer className="tab-pane" data={frame.binary} />}
        </div>
      );
    }
}
