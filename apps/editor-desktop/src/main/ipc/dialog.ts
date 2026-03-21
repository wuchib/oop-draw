import { ipcMain } from 'electron';

export function registerDialogIpc(): void {
  ipcMain.handle('oop-draw:ping-dialog', async () => 'ok');
}
