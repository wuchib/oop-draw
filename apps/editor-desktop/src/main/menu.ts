import { Menu } from 'electron';

export function registerAppMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'copy' }, { role: 'paste' }],
    },
  ]);

  Menu.setApplicationMenu(menu);
}
