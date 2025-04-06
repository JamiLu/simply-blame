import * as vscode from 'vscode';
import ExtensionManager from './ExtensionManager';
import Logger from './Logger';

export function activate(context: vscode.ExtensionContext) {
	Logger.log(`active version 0.0.13-test-final`);
	ExtensionManager.getInstance(context).registerCommands();
}

export function deactivate() {
	Logger.dispose();
}
