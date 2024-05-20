import * as vscode from 'vscode';

class Notifications {

    static gitNotFoundNotification = () => vscode.window.showErrorMessage('Git installion not found');
    static parsingBlameFailed = async () => {
        const submit = await vscode.window.showErrorMessage('Parsing blame failed.', 'Submit a bug report');

        if (!!submit) {
            vscode.env.openExternal(vscode.Uri.parse(`https://github.com/JamiLu/simply-blame/issues/new?labels=bug&title=Parsing+name+failed&body=Blame+failed+to+parse+names:`));
        }
    };
    static commonErrorNotification = (message?: string) => vscode.window.showErrorMessage(message ?? 'Something went wrong');

}

export default Notifications;
