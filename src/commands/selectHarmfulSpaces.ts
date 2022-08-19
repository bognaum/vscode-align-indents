import * as vsc from "vscode";
import {
	searchInIndents,
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	offsetsToSelection,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
} from "../functions";

export default function selectHarmfulSpaces(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		doc  = tEditor.document,
		opts = tEditor.options,
		EOL  = ["", "\n", "\r\n"][doc.eol],
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
		" ".repeat(opts.tabSize) : "\t",
		newSelections: vsc.Selection[] = [];
	
	tEditor.edit((edit) => {
		for (let sel of tEditor.selections) {
			const 
				wholeStringsRange = getWholeLinesRange(doc, sel),
				startOffset = doc.offsetAt(wholeStringsRange.start),
				newSel = new vsc.Selection(wholeStringsRange.start, wholeStringsRange.end),
				text = doc.getText(wholeStringsRange),
				harmfulSpaces: [number, number][] = searchInIndents(text, EOL, / (?=\t)/g);
			
			harmfulSpaces.forEach((v,i,a) => {
				v.forEach((v,i,a) => a[i] = startOffset + v);
			});
			console.log(`harmfulSpaces >>`, harmfulSpaces);

			for (const offs of harmfulSpaces) {
				newSelections.push(offsetsToSelection(doc, offs));
			}
			// edit.replace(sel, doc.getText(sel).trim());
			// newSelections.push(sel);
		}
		tEditor.selections = newSelections;
	});
}