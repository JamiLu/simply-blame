/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import ExtensionManager from './ExtensionManager';
import Logger from './Logger';
import EditorManager from './Editor';

export function activate(context: vscode.ExtensionContext) {
    ExtensionManager.getInstance(context).registerCommands();
}

export function deactivate() {
    EditorManager.getInstance().disposeEditors();
    Logger.dispose();
}
