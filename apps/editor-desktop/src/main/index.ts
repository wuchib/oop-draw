import { app } from 'electron';
import { createMainWindow } from './window';
import { registerDocumentIpc } from './ipc/document';
import { registerDialogIpc } from './ipc/dialog';
import { registerAppMenu } from './menu';

app.whenReady().then(async () => {
  registerDocumentIpc();
  registerDialogIpc();
  registerAppMenu();
  await createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
