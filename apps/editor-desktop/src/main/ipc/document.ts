import { promises as fs } from 'node:fs';
import { ipcMain, dialog, shell } from 'electron';
import type { CanvasDocument } from '@oop-draw/shared';

export function registerDocumentIpc(): void {
  ipcMain.handle('oop-draw:open-document', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'OOP Draw JSON', extensions: ['json'] }],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const raw = await fs.readFile(result.filePaths[0], 'utf8');
    return JSON.parse(raw) as CanvasDocument;
  });

  ipcMain.handle('oop-draw:save-document', async (_event, document: CanvasDocument) => {
    const result = await dialog.showSaveDialog({
      filters: [{ name: 'OOP Draw JSON', extensions: ['json'] }],
      defaultPath: 'oop-draw.json',
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    await fs.writeFile(result.filePath, JSON.stringify(document, null, 2), 'utf8');
  });

  ipcMain.handle('oop-draw:notify', async (_event, message: string) => {
    await dialog.showMessageBox({ message, buttons: ['OK'] });
  });

  ipcMain.handle('oop-draw:open-external', async (_event, url: string) => {
    await shell.openExternal(url);
  });
}
