import * as vscode from 'vscode';

class Notifications {

    static gitNotFoundNotification = () => vscode.window.showErrorMessage('Git installion not found');
    static parsingBlameFailed = () => vscode.window.showErrorMessage('Parsing blame failed.', 'Submit a bug report');
    static commonErrorNotification = (message?: string) => vscode.window.showErrorMessage(message ?? 'Something went wrong');

}

export default Notifications;
