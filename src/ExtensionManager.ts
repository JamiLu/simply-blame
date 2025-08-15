/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import BlameManager from './BlameManager';
import Settings from './Settings';
import { hashAction } from './HashAction';
import BlameHoverProvider from './BlameHoverProvider';

class ExtensionManager {

    private static instance: ExtensionManager;

    private context: vscode.ExtensionContext;
    private blameManager: BlameManager;
    private blameHoverProvider: BlameHoverProvider;
    private sbStatus: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.blameManager = new BlameManager();
        this.blameHoverProvider = new BlameHoverProvider(this.blameManager);
        this.sbStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.sbStatus.show();
    }

    static setBusy(busy: boolean) {
        if (busy) {
            this.instance.sbStatus.text = 'Simply Blame $(loading~spin)';
        } else {
            this.instance.sbStatus.text = 'Simply Blame';
        }
    }

    registerCommands() {
        const debugCommand = vscode.commands.registerTextEditorCommand('simply-blame.openBlameInEditorDebugCommand', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await this.blameManager.openBlameEditor(textEditor);
        });

        const blameCommand = vscode.commands.registerTextEditorCommand('simply-blame.simplyBlame', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await this.blameManager.toggleBlame(textEditor);
        });

        const hashActionCommand = vscode.commands.registerCommand('simply-blame.hashAction', async ({ hash }: any) => {
            await hashAction(hash);
        });

        const hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file' }, this.blameHoverProvider);

        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(Settings.config)) {
                this.blameManager.refresh();
                this.blameHoverProvider.refresh();
            }
        });

        vscode.window.onDidChangeActiveTextEditor(() => {
            this.blameManager.closeBlame();
        });

        vscode.window.onDidChangeActiveColorTheme(() => {
            this.blameManager.refresh();
        });

        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.isDirty) {
                this.blameManager.refresh(event);
            }
        });

        this.context.subscriptions.push(debugCommand, blameCommand, hashActionCommand, this.sbStatus, hoverProvider);
    }

    static getInstance(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new ExtensionManager(context);
        }
        return this.instance;
    }
}

export default ExtensionManager;
