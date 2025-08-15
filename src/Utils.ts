/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';

export const getFilename = (path: string) => {
    const sepIndex = path.lastIndexOf('/');
    return path.substring(sepIndex > -1 ? sepIndex + 1 : path.lastIndexOf('\\') + 1);
};

export const getLocation = (path: string): string => {
    return path.replace(getFilename(path), '');
};

export const isDarkTheme = () => {
    return [vscode.ColorThemeKind.Dark, vscode.ColorThemeKind.HighContrast].includes(vscode.window.activeColorTheme.kind);
};
