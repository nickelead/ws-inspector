export type IFrameType = 'incoming' | 'outgoing';
export type IFrame = {
  type: IFrameType;
  name: string;
  id: number;
  time: Date;
  length: number;
};
