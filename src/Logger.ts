/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';

class Logger {

    private static logger: Logger;
    private channel: vscode.LogOutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel('simply-blame', { log: true});
    }

    log(msg: string) {
        this.channel.appendLine(msg);
    }

    dispose() {
        this.channel.dispose();
    }

    static get instance() {
        if (!this.logger) {
            this.logger = new Logger();
        }
        return this.logger;
    }
}

export default Logger.instance;
