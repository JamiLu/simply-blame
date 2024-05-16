import * as vscode from 'vscode';

class Logger {

    static instance: Logger;
    
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        vscode.workspace.fs.createDirectory(context.logUri);
        // vscode.workspace.fs.writeFile(context.logUri, Uint8Array.from(''.toString()));
    }

    log(msg: string) {
        
        
    }
    

    static initialize(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new Logger(context);
        }
        return this.instance;
    }
}

export default Logger.instance;
