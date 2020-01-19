type IFrameType = 'incoming' | 'outgoing';
export type IFrame = {
  type: IFrameType;
  name: string;
  id: number;
  time: Date;
  length: number;
  text?: string;
  binary?: Uint8Array; //TODO string to buffer type
};

export interface EFilter {
  regName: string;
  filter: ;
  isFilterInverse: boolean;
}
