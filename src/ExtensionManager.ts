/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import BlameManager from './BlameManager';
import Settings from './Settings';

class ExtensionManager {

    private static instance: ExtensionManager;

    private context: vscode.ExtensionContext;
    private blameManager: BlameManager;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.blameManager = new BlameManager();
    }

    registerCommands() {
        const debugCommand = vscode.commands.registerTextEditorCommand('simply-blame.openBlameInEditorDebugCommand', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await this.blameManager.openBlameEditor(textEditor);
        });

        const blameCommand = vscode.commands.registerTextEditorCommand('simply-blame.simplyBlame', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await this.blameManager.toggleBlame(textEditor);
        });

        const copyHashCommand = vscode.commands.registerCommand('simply-blame.copyCommit', (args: any) => {
            const { hash } = args;
            vscode.env.clipboard.writeText(hash);
            vscode.window.showInformationMessage(`Commit ${hash} copied to clipboard`);
        });

        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(Settings.config)) {
                this.blameManager.refresh();
            }
        });

        vscode.window.onDidChangeActiveTextEditor(() => {
            this.blameManager.closeBlame();
        });

        vscode.window.onDidChangeActiveColorTheme(() => {
            this.blameManager.refresh();
        });

        vscode.workspace.onDidChangeTextDocument(() => {
            this.blameManager.refresh();
        });

        this.context.subscriptions.push(debugCommand, blameCommand, copyHashCommand);
    }

    static getInstance(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new ExtensionManager(context);
        }
        return this.instance;
    }
}

export default ExtensionManager;
