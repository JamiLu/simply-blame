import * as vscode from 'vscode';
import { BlamedDocument, BlamedDate } from './Blame';
import Settings from './Settings';

export interface IndexedHeatMap {
  	[key: string]: string | vscode.ThemeColor;
}

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
