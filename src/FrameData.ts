  /*import { FrameEntryType, WebSocketFrame } from './viewer/types';
import { checkViable, getName, stringToBuffer } from './viewer/Helpers/Helper';
type INC = 'incoming';
type OUT = 'outgoing';
export type frameSendingType = INC | OUT;
enum contentType {
  json = 'JSON',
  binary = 'BINARY',
  text = 'TEXT',
}

interface FrameAddingProps {
  id: string;
  sendingType: frameSendingType;
  contentType: contentType;
  time: Date;
  length: number;
  text: string;
  content?: string | Uint8Array | object;
}
// TODO to simplify by using _public_ in constructor
export class FrameEntry {
  id: string;
  sendingType: frameSendingType;
  contentType: contentType;
  time: Date;
  length: number;
  text: string;
  content?: string | Uint8Array | object;
  constructor(args: FrameAddingProps) {
    this.id = args.id;
    this.sendingType = args.sendingType;
    this.contentType = args.contentType;
    this.time = args.time;
    this.length = args.length;
    this.text = args.text;
    this.content = args.content;
    // Here can be added keys of JSON object or other data
  }
}
// Uses parameters from Network.WebSocket method to add FrameEntry to array
export const getFrame = (
  sendingType: frameSendingType,
  requestId: string,
  timestamp: number,
  response: WebSocketFrame
) => {
  // Checks ContentType and assigns Content
  const isDataTextOrObject = response.opcode === 1;
  const isDataBinary = response.opcode === 2;
  if (isDataTextOrObject || isDataBinary) {
    let assignedContentType: contentType;
    let assignedContent: string | Uint8Array | object; // TODO Default value?
    if (isDataBinary) {
      assignedContent = stringToBuffer(response.payloadData);
      assignedContentType = contentType.binary;
    }
    if (isDataTextOrObject) {
      try {
        assignedContent = JSON.parse(response.payloadData);
        assignedContentType = contentType.json;
      } catch {
        assignedContent = response.payloadData;
        assignedContentType = contentType.text;
      }
    }
    // Creates a new Frame Entry
    const FrameAddingProps: FrameAddingProps = {
      id: Date.now().toString(),
      sendingType: sendingType,
      contentType: assignedContentType,
      time: timestamp, // FIXME Dependency from App
      length: response.payloadData.length,
      text: response.payloadData,
      content: assignedContent,
    };
    const frameEntry = new FrameEntry(FrameAddingProps);
    return frameEntry; // TODO change to FrameAddingProps?
  }
};
// FrameDataArray is an array that has all registered and processed(altered) frames
export default class FrameDataArray {
  constructor() {
    this.frames = [];
  }

  frames: FrameEntry[] = [];
  // TODO Method shouldn't rely on extensional parameters
  addFrameEntry(
    sendingType: frameSendingType,
    requestId: string,
    timestamp: number,
    response: WebSocketFrame
  ): void {
    const newFrame = getFrame(sendingType, requestId, timestamp, response);
    this.frames.push(newFrame);
  }

  deleteAllFrameEntries(): void {
    this.frames = [];
  }
  // FrameViewArray represents all frames that had been filtered and grepped
  getFrameViewArray(): FrameEntry[] {
    // TODO make connection with control panel
    const MAX_STRING_LENGTH = 275;
    const regName = '',
      filter = '',
      isFilterInverse = false;
    const frameViewArray = [];
    this.frames.map((frameEntry: FrameEntry) => {
      // TODO refactor checkViable() newGetName to comply with new types
      if (!checkViable(frameEntry as FrameEntryType, { regName, filter, isFilterInverse })) {
        const greppedText = getName(frameEntry, { regName, filter, isFilterInverse });
        const processedFrameEntry = {...frameEntry}; // copy = JSON.parse(JSON.stringify(original));
        processedFrameEntry.text = greppedText.slice(0, MAX_STRING_LENGTH);
        processedFrameEntry.content = undefined;
        frameViewArray.push(processedFrameEntry);
      }
    });
    return frameViewArray;
  }
}

/*
FrameDataObject = {
  frames: {id as string: FrameEntry object};
  ids: array of id as string
}

 */
