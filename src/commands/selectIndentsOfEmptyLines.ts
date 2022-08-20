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

export default function selectIndentsOfEmptyLines(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
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
				[start, end] = rangeToOffsets(doc, wholeStringsRange),
				text = doc.getText(wholeStringsRange),
				lines = text.split(EOL);
			let currLineStart = start;
			for (const line of lines) {
				if (lineIsEmpty(line)) {
					const a = currLineStart, b = currLineStart + line.length;
					newSelections.push(offsetsToSelection(doc, [a, b]));
				} else {}
				currLineStart += line.length + EOL.length;
			}
			for (let i = start; i < end; i++) {
				
			}
			// edit.replace(sel, doc.getText(sel).trim());
			// newSelections.push(sel);
		}
		if (newSelections.length) {
			tEditor.selections = newSelections;
		} else {
			vsc.window.showInformationMessage("Empty lines not found.");
		}
	});
}

function lineIsEmpty(line: string): boolean {
	return /^\s*$/.test(line);
}
