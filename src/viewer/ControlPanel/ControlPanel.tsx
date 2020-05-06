import React, { ChangeEvent, MouseEvent } from 'react';
import FontAwesome from 'react-fontawesome';
import cx from 'classnames';
import './ControlPanel.scss';
import { EFilter } from '../types';
import { useRootStoreContextHook } from '../../stores/RootStore';
import { useLocalStore } from 'mobx-react';


interface ControlPanelProps extends EFilter {}
interface ControlPanelState {
  openInput?: null | 'filter' | 'name';
}

export const ControlPanel = (props) => {
  const { controlStore } = props;

  const onRegName = (e: ChangeEvent<HTMLInputElement>) => {
    controlStore.handleRegName(e.target.value);
  };

  const onFilter = (e: ChangeEvent<HTMLInputElement>) => {
    handleFilter(e.target.value);
  };

  const inputState = useLocalStore( () => {
    openInput: null;
    openNameReg = () => {
      if (inputState.openInput === 'name') {
        inputState.openInput = null;
      } else {
        inputState.openInput = 'name'
      }
    }

    openFilter = () => {
      if (inputState.openInput === 'filter') {
        inputState.openInput = null;
      } else {
        inputState.openInput = 'filter' ;
      }
    };
  })

  const onClear = () => {};
  const onFilterModeToggle = () => {};
  const openNameReg = () => {};
  const openFilter = () => {};

  return (
    <div className="list-controls">
      <span
        className={controlStore.isCapturing ? 'list-button record active' : 'list-button record'}
        onClick={controlStore.toggleIsCapturing}
        title={controlStore.isCapturing ? 'Stop' : 'Start'}
      />
      <FontAwesome className="list-button" name="ban" onClick={onClear} title="Clear" />
      <div>{controlStore.isCapturing}</div>
      <span className={'separator'} />
      {/* name */}
      <FontAwesome
        className={cx('list-button', {
          active: !!controlStore.regName,
        })}
        name="file-signature"
        onClick={openNameReg}
        title="RexExp"
      />
      <div
        className={cx('input-wrap', {
          hide: controlStore.openInput !== 'name',
        })}
      >
        <input
          className={'input'}
          name={'reg-name'}
          placeholder={'Name regexp: "type":"(\\w+)"'}
          value={controlStore.regName}
          onChange={onRegName}
        />
      </div>

      {/* filter */}
      <FontAwesome
        className={cx('list-button', {
          active: !!controlStore.filter,
        })}
        name="filter"
        onClick={openFilter}
        title="Filter"
      />

      <div
        className={cx('input-wrap', {
          hide: controlStore.openInput !== 'filter',
        })}
      >
        <input
          className={'input'}
          name={'open-filter'}
          placeholder={'Filter regexp'}
          value={controlStore.filter}
          onChange={onFilter}
        />
        <FontAwesome
          className="list-button"
          onClick={onFilterModeToggle}
          name={controlStore.isFilterInverse ? 'check-square' : 'square'}
        />
        to {controlStore.filter}
      </div>
    </div>
  );
};

/*
constructor(props: ControlPanelProps) {
  super(props);
  const controlStore = this.props;
  /*   this.state = {
       openInput: null, // 'filter' | 'name'
     };



*/
