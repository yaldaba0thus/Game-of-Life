import { app, BrowserWindow, Menu } from "electron";
import path from "path";

function create_window(): BrowserWindow {
    const window: BrowserWindow = new BrowserWindow({
        width: 1600,
        height: 1600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    window.loadURL(`file://${path.join(__dirname, 'index.html')}`);
    Menu.setApplicationMenu(null);
    window.on("closed", () => {
        window.destroy();
    });

    return window;
}

function main() {
    let main_window: BrowserWindow | null = null;
    app.whenReady().then(() => {
        main_window = create_window();
    });
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0) {
            main_window = create_window();
        }
    });
}

main();
