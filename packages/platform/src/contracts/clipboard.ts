export interface ClipboardService {
  copyText(value: string): Promise<void>;
}
