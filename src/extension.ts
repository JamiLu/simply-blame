import * as vscode from 'vscode';
import ExtensionManager from './ExtensionManager';

export function activate(context: vscode.ExtensionContext) {
    ExtensionManager.getInstance(context).registerCommands();
}

export function deactivate() {}
