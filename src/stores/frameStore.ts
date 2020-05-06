import { action, computed, observable } from 'mobx';
import * as Helpers from '../viewer/Helpers/Helper';
import { ControlStore } from './controlStore';
import { WebSocketFrame } from '../viewer/types';

type INC = 'incoming';
type OUT = 'outgoing';
export type frameSendingType = INC | OUT;
enum contentType {
  json = 'JSON',
  binary = 'BINARY',
  text = 'TEXT',
}

export class FrameEntry {
  static frameIssueTime: number;
  static frameIssueWallTime: number;
  id: string;
  sendingType: frameSendingType;
  time: Date;
  length: number;
  text: string;
  opcode: number;
  private _contentType?: contentType;
  private _content?: string | Uint8Array | object;

  @computed
  get name() {
    return Helpers.getName(this, this.control.regName);
  }

  get contentType(): contentType {
    if (!this._contentType) {
      this.parseContent();
    }
    return this._contentType!;
  }

  get content(): string | Uint8Array | object | undefined {
    if (!this._content) {
      this.parseContent();
    }
    return this._content;
  }

  constructor(
    sendingType: frameSendingType,
    requestId: string,
    timestamp: number,
    response: WebSocketFrame,
    private control: ControlStore
  ) {
    this.opcode = response.opcode;
    this.id = Date.now().toString();
    this.sendingType = sendingType;
    this.time = this.setTime(timestamp);
    this.length = response.payloadData.length;
    this.text = response.payloadData;
  }
  setTime(timestamp: number) {
    if (!FrameEntry.frameIssueTime) {
      FrameEntry.frameIssueTime = timestamp;
      FrameEntry.frameIssueWallTime = new Date().getTime();
    }
    return new Date((timestamp - FrameEntry.frameIssueTime) * 1000 + FrameEntry.frameIssueWallTime);
  }
  parseContent() {
    const isDataTextOrObject = this.opcode === 1;
    const isDataBinary = this.opcode === 2;
    this._contentType = contentType.text;
    if (isDataBinary) {
      this._content = Helpers.stringToBuffer(this.text);
      this._contentType = contentType.binary;
    } else if (isDataTextOrObject) {
      try {
        this._content = JSON.parse(this.text);
        this._contentType = contentType.json;
      } catch {
        this._content = this.text;
        this._contentType = contentType.text;
      }
    } else {
      throw new Error(`Unexpected opcode in a frame: ${this.opcode}`);
    }
  }
}

export class FrameStore {
  @observable
  frames: FrameEntry[] = [];
  constructor(private controlStore: ControlStore) {}

  @action
  addFrameEntry(
    sendingType: frameSendingType,
    requestId: string,
    timestamp: number,
    response: WebSocketFrame
  ): void {
    const newFrame = new FrameEntry(sendingType, requestId, timestamp, response, this.controlStore);
    this.frames.push(newFrame);
  }
  @action
  deleteAllFrameEntries(): void {
    this.frames = [];
  }
  @computed
  get framesFiltered() {
    const { filter, isFilterInverse } = this.controlStore;
    return this.frames.filter((frame) => {
      return Helpers.checkViable(frame, filter, isFilterInverse);
    });
  }
  @computed
  get activeFrame() {
    return this.frames.find((frameEntry) => frameEntry.id === this.controlStore.activeId);
  }
}


