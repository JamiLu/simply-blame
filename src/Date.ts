/**
 * License GPL-2.0
 */
import * as vscode from "vscode";

export const prependZero = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
};

export const prependSpace = (date: string) => {
    return date.padStart(10 - date.length + date.length, '\u2007');
};

export const parseDate = (date: Date, dateFormat: string) => {
    if (dateFormat === 'system') {
        return prependSpace(date.toLocaleDateString(vscode.env.language));
    }

    const delimitter = dateFormat.match(/\-|\.|\//)?.join();
    const dateFormatParts = dateFormat.split(delimitter!);

    const days = date.getDate();
    const months = date.getMonth() + 1;
    const year = date.getFullYear();

    switch (dateFormatParts[0]) {
        case 'YYYY':
            return [year, months, days].map(prependZero).join(delimitter);
        case 'DD':
            return [days, months, year].map(prependZero).join(delimitter);
        case 'D':
            return prependSpace([days, months, year].join(delimitter));
        case 'MM':
            return [months, days, year].map(prependZero).join(delimitter);
        default:
            return prependSpace([months, days, year].join(delimitter));
    }
};
