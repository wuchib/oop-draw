export interface WindowService {
  notify(message: string): Promise<void>;
}
