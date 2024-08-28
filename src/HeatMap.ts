import * as vscode from 'vscode';
import { BlamedDocument, BlamedDate } from './Blame';

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

	distinctDates.forEach((date, idx) => {
		if (idx < heatColors.length) {
			indexedHeatMap[date.dateString] = heatColors[idx];
		}
	});

	return indexedHeatMap;
};

export const getHeatColor = (date: BlamedDate, heatMap: IndexedHeatMap, defaultColors: string[]) => {
	return (
		heatMap[date.dateString] || defaultColors[defaultColors.length - 1]
	);
};
