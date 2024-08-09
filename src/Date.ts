import * as vscode from "vscode";
import Settings from "./Settings";

const appendZeroToString = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
};

export const parseDate = (date: Date) => {
    const dateFormat = Settings.getDateFormat();
    if (dateFormat === 'system') {
        return date.toLocaleDateString(vscode.env.language);
    }

    const delimitter = dateFormat.match(/\-|\.|\//)?.join();
    const startDate = dateFormat.indexOf('D') === 0;
    const days = date.getDate();
    const months = date.getMonth() + 1;
    const year = date.getFullYear();

    if (startDate) {
        return [days, months, year].map(appendZeroToString).join(delimitter);
    } else {
        return [months, days, year].map(appendZeroToString).join(delimitter);
    }
};
