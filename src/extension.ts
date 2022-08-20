import * as vsc from 'vscode';
import alignIndents from './commands/alignIndents';
import alignIndentSteps from './commands/alignIndentSteps';
import selectHarmfulSpaces from './commands/selectHarmfulSpaces';

import { 
	selectIndentSpacesBy1,
	selectIndentSpacesBy2,
	selectIndentSpacesBy3,
	selectIndentSpacesBy4,
	selectIndentSpacesBy5,
	selectIndentTabs,
	selectIndentSpacesByAuto,
	selectIndentsAuto
 } from "./commands/selectIndents";

export function activate(context: vsc.ExtensionContext) {
	const commands = [
		// vsc.commands.registerCommand('my-command', () => {}),
		// vsc.commands.registerTextEditorCommand('my-command', (tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) => {}),
		vsc.commands.registerTextEditorCommand('align-indents.alignIndents', alignIndents),
		vsc.commands.registerTextEditorCommand('align-indents.alignIndentSteps', alignIndentSteps),
		vsc.commands.registerTextEditorCommand('align-indents.selectHarmfulSpaces', selectHarmfulSpaces),

		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesBy1',    selectIndentSpacesBy1   ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesBy2',    selectIndentSpacesBy2   ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesBy3',    selectIndentSpacesBy3   ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesBy4',    selectIndentSpacesBy4   ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesBy5',    selectIndentSpacesBy5   ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentTabs',         selectIndentTabs        ),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentSpacesByAuto', selectIndentSpacesByAuto),
		vsc.commands.registerTextEditorCommand('align-indents.selectIndentsAuto',        selectIndentsAuto       ),
	];

	context.subscriptions.push(...commands);
}

export function deactivate() {}