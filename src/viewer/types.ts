export type IFrameType = 'incoming' | 'outgoing';
export type IFrame = {
  type: IFrameType;
  name: string;
  id: number;
  time: Date;
  length: number;
  text?: string;
  binary?: Uint8Array;
  json?: object;
};

export interface EFilter {
  regName: string;
  filter: string;
  isFilterInverse: boolean;
}
export interface Response {
  opcode: number;
  payloadData: string;
}
