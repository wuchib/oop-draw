export interface FileDialogService {
  openDocument(): Promise<File | null>;
}
