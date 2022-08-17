import * as vsc from "vscode";
import {
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
} from "../functions";

export default function alignIndents(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		doc  = tEditor.document,
		opts = tEditor.options,
		EOL  = ["", "\n", "\r\n"][doc.eol],
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
		" ".repeat(opts.tabSize) : "\t",
		newSelections: vsc.Selection[] = [];
	
	tEditor.edit((edit) => {
		const tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1;
		for (let sel of tEditor.selections) {
			const 
				wholeStringsRange = getWholeLinesRange(doc, sel),
				newSel = new vsc.Selection(wholeStringsRange.start, wholeStringsRange.end),
				text = doc.getText(wholeStringsRange),
				lines = text.split(EOL);
			const 
				stack: ILevelModel [] = [],
				last = () => stack[stack.length - 1];

			for (const [k, line] of lines.entries()) {
				const 
					[indent, payload] = separateIndent(line),
					offset = getIndentOffset(indent, opts),
					lModel: ILineModel = {
						type: "ILineModel",
						raw: line,
						indent,
						payload,
						offset,
					};
				if (!k) {
					stack.push({
						type: "ILevelModel",
						indent,
						offset, 
						ch: []
					});
				} else {}

				if (!payload) {
					last().ch.push(lModel);
				} else if (offset === last().offset) {
					last().ch.push(lModel);
				} else if (last().offset < offset) {
					const level: ILevelModel = {
						type: "ILevelModel",
						offset,
						indent,
						ch: [
							lModel
						]
					};
					// level.ch.push(lModel);
					last().ch.push(level);
					stack.push(level);
				} else if (offset < last().offset) {
					while (stack.length) {
						if (1 < stack.length) {
							stack.pop();
							if (offset === last().offset) {
								last().ch.push(lModel);
								break;
							} else if (last().offset < offset) {
								last().ch.push(lModel);
								break;
							} else if (offset < last().offset) {
								continue;
							}
						} else {
							const level: ILevelModel = {
								type: "ILevelModel",
								offset, 
								indent,
								ch: [
									last(),
									lModel
								]
							};
							stack.unshift(level);
							break;
						}
					}
				} else {}
			}
			const 
				model = stack[0],
				baseIndent = model.indent,
				newLines: string [] = [];
			recur(model);
			let newText = newLines.join(EOL);


			edit.replace(wholeStringsRange, newText);
			// edit.replace(sel, doc.getText(sel).trim());
			newSelections.push(newSel);

			function recur(node: (ILevelModel|ILineModel), level: number =-1) {
				if (node.type === "ILevelModel") {
					for (const ch of node.ch) {
						recur(ch, level + 1);
					}
				} else if (node.type === "ILineModel") {
					const 
						pl = node.payload,
						line = pl ? baseIndent + TAB.repeat(level)+pl : "";
					newLines.push(line);
				} else {}
			}
		}
		tEditor.selections = newSelections;
	});
}

interface ILevelModel {
	type:   "ILevelModel";
	offset: number;
	indent: string;
	ch:     (ILineModel|ILevelModel) [];
}

interface ILineModel {
	type:    "ILineModel";
	raw:     string;
	indent:  string;
	payload: string;
	offset:  number;
}
