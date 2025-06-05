interface ElectronAPI {
  on: (channel: string, callback: (data: any) => void) => void;
  send: (channel: string, data: any) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 