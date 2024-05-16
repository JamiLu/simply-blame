import * as vscode from 'vscode';
import ExtensionManager from './ExtensionManager';

/**
 *  TODO
 * 
 *  - clean the code OK
 *  - write more tests OK
 *    - for heat map OK
 *    - error occurs during blame show notification OK
 *  - create repo OK
 *  - publish to store
 */


export function activate(context: vscode.ExtensionContext) {
	ExtensionManager.getInstance(context).registerCommands();
}

export function deactivate() {}
