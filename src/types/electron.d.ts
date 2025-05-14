interface ElectronAPI {
  on: (channel: string, callback: (data: any) => void) => void;
  send: (channel: string, data: any) => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 