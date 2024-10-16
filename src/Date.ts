import * as vscode from "vscode";
import Settings from "./Settings";

const appendZeroToString = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
};

export const parseDate = (date: Date) => {
    const defaultDateString = date.toLocaleDateString(vscode.env.language);
    
    const dateFormat = Settings.getDateFormat();
    if (dateFormat === 'system') {
        return defaultDateString;
    }

    const delimitter = dateFormat.match(/\-|\.|\//)?.join();
    if (delimitter === null) {
        return defaultDateString;
    }

    const words = dateFormat.split(delimitter!);
    if (words.length === 0) {
        return defaultDateString;
    }

    const days = date.getDate();
    const months = date.getMonth() + 1;
    const year = date.getFullYear();

    switch (words[0]) {
        case "YYYY":
            return [year, months, days].map(appendZeroToString).join(delimitter);
        case "DD":
            return [days, months, year].map(appendZeroToString).join(delimitter);
        default:
            return [months, days, year].map(appendZeroToString).join(delimitter);
    }
};
