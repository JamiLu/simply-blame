import * as vscode from 'vscode';
import { BlamedDocument, BlamedDate } from './Blame';
import Settings from './Settings';
import { isDarkTheme } from './Utils';

export interface IndexedHeatMap {
  	[key: string]: string | vscode.ThemeColor;
}

type RGBC = {
    r: number;
    g: number;
    b: number;
    c: number;
};

const toDistinctDates = (prev: BlamedDate[], curr: BlamedDate) => {
	if (!prev.find((date) => date.dateString === curr.dateString)) {
		prev.push(curr);
	}
	return prev;
};

export const indexHeatColors = (blamedDocument: BlamedDocument[], heatColors: string[]): IndexedHeatMap => {
	const distinctDates = blamedDocument
		.filter(Boolean)
		.map((doc) => doc.date)
		.reduce(toDistinctDates, [] as BlamedDate[]);
		
	distinctDates.sort((a, b) => b.dateMillis - a.dateMillis);

	const indexedHeatMap = {} as IndexedHeatMap;

	const strategy = Settings.getHeatColorIndexStrategy();

	if (strategy === 'scale') {
		const first = distinctDates.shift();
		const last = distinctDates.pop();

		if (first) {
			indexedHeatMap[first.dateString] = heatColors[0];
		}

		const commitPerColor = Math.max(1, Math.round(distinctDates.length / (heatColors.length - 2)));

		let colorIndex = 1;
		distinctDates.forEach((date, idx) => {
			indexedHeatMap[date.dateString] = heatColors[colorIndex] || heatColors.at(-1)!;
			if (idx % commitPerColor === 0) {
				colorIndex++;
			}
		});

		if (last) {
			indexedHeatMap[last.dateString] = heatColors.at(-1)!;
		}
	} else {
		distinctDates.forEach((date, idx) => {
			if (idx < heatColors.length) {
				indexedHeatMap[date.dateString] = heatColors[idx];
			}
		});
	}

	return indexedHeatMap;
};

const toHex =(n: number) => {
	const hex = Math.max(0, Math.min(n, 255)).toString(16);
	if (Number(hex) < 10) {
		return `0${hex}`;
	} else if (hex.length === 1) {
		return `1${hex}`;
	}
	return hex;
}

const createColor = (r: number, g: number, b: number) => {
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const equalizedColor = (orig: RGBC, i: number, c: number) => {
	// normal increment value
	const nr = orig.r - i * c;
	const ng = orig.g - i * c;
	const nb = orig.b - i * c;
	const max = Math.max(nr, ng, nb);
	// (9 - i + 1) reverse increment * c reverse increment value
	const lr = orig.r - (9 - i + 1) * c;
	const lg = orig.g - (9 - i + 1) * c;
	const lb = orig.b - (9 - i + 1) * c;
	// (i - 5) increment from 1 on 6th index. (i - 5) * c increment value after 6th index
	const r = nr < max ? lr : nr + (i - 5) * c - (i - 5);
	const g = ng < max ? lg : ng + (i - 5) * c - (i - 5);
	const b = nb < max ? lb : nb + (i - 5) * c - (i - 5);

	return createColor(r, g, b);
}

export const generateHeatMapColors = (color: RGBC) => {
	const change = Math.round(255 / 100 * color.c);
	const variations = 10;
	const countChange = (base: number, m: number) => base - (m * change);

	if (isDarkTheme()) {
		const colors: string[] = Array(variations - 1).fill(0).map((_, i) => 
			createColor(
				countChange(color.r, i),
				countChange(color.g, i),
				countChange(color.b, i)));

		colors.push(
			createColor(
				countChange(color.r, colors.length) - 7, 
				countChange(color.g, colors.length) - 7, 
				countChange(color.b, colors.length) - 7));

		return colors;
	} else {
		return Array(variations).fill(0).map((_, i) => {
			if (i < 6) {
				return createColor(
					countChange(color.r, i),
					countChange(color.g, i),
					countChange(color.b, i));
			} else {
				const r = countChange(color.r, i);
				const g = countChange(color.g, i);
				const b = countChange(color.b, i);
				const avg = (r + g + b) / 3;
				if (avg === r && avg === g && avg === b) {
					return i < 9 ? createColor(r, g, b) : createColor(r - 7, g - 7, b - 7);
				} else {
					return equalizedColor(color, i, change);
				}
			}
		});
	}
};
