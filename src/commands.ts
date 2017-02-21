import * as vscode from 'vscode';
import { ModalState } from './state';
import { Mode } from './mode';
import * as utils from './utils';

export let commandRegistry = {
  /*
  ** MOVEMENT AND SELECTION COMMANDS
  */
  "h": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, false);
    }
  },
  "H": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Left, true);
    }
  },
  "l": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, false);
    }
  },
  "L": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Right, true);
    }
  },
  "j": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, false);
    }
  },
  "J": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Down, true);
    }
  },
  "k": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, false);
    }
  },
  "K": {
    repeatable: true,
    exec: (state: ModalState) => {
      utils.moveCursor(utils.CursorDirection.Up, true);
    }
  },
  "w": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\w*\s*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "W": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\w*\s*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "e": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        let start = selection.active;
        const text = utils.getToEof(start);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\s*\w*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            start,
            start.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "E": {
    repeatable: true,
    exec: async (state: ModalState) => {
      let document = vscode.window.activeTextEditor.document;
      let selections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of selections) {
        const text = utils.getToEof(selection.active);
        let jump = text.match(/^[^\w\s]*/)[0].length;
        if (jump <= 0) { jump = text.match(/^\s*\w*/)[0].length; }
        newSelections.push(
          new vscode.Selection(
            selection.anchor,
            selection.active.translate({characterDelta: jump})
          )
        );
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "b": {
    repeatable: true,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "B": {
    repeatable: true,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorWordLeftSelect');
    }
  },
  "f": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.resetCursor();
      state.setMode(Mode.CharacterFind);
    }
  },
  "F": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.setMode(Mode.CharacterFind);
    }
  },
  "findChar": {
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, true, forward);
      state.setMode(Mode.Selection);
    }
  },
  "t": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "T": {
    repeatable: false,
    exec: (state: ModalState, char: string) => {
      state.setMode(Mode.CharacterTo);
    }
  },
  "toChar": {
    repeatable: false,
    exec: async (state: ModalState, char: string, forward: boolean) => {
      utils.goToChar(char, false, forward);
      state.setMode(Mode.Selection);
    }
  },
  "x": {
    repeatable: false,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('expandLineSelection');
    }
  },
  "X": {
    repeatable: false,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('expandLineSelection');
    }
  },
  "m": {
    repeatable: false,
    exec: async (state: ModalState) => {
      // VSCode's jump to bracket functionality doesn't work across multiple cursors (as of now), or
      // support selections, so we copy the original cursors, then loop through each one and jump to bracket,
      // then use the original anochor as the selection point for a new set of selections.
      state.resetCursor();
      const originalSelections = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection of originalSelections) {
        vscode.window.activeTextEditor.selection = selection;
        await vscode.commands.executeCommand('editor.action.jumpToBracket');
        const delta = selection.anchor.isBefore(vscode.window.activeTextEditor.selection.active) ? 1 : 0;
        const newSelection = new vscode.Selection(selection.anchor, vscode.window.activeTextEditor.selection.active.translate({characterDelta: delta}));
        newSelections.push(newSelection);
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "M": {
    repeatable: false,
    exec: async (state: ModalState) => {
      // See "m" for notes on how this works. It can be tricky!
      const originalSelections = vscode.window.activeTextEditor.selections;
      state.resetCursor();
      const selectionsAfterReset = vscode.window.activeTextEditor.selections;
      let newSelections: vscode.Selection[] = [];
      for (let selection in selectionsAfterReset) {
        vscode.window.activeTextEditor.selection = selectionsAfterReset[selection];
        await vscode.commands.executeCommand('editor.action.jumpToBracket');
        const delta = selectionsAfterReset[selection].anchor.isBefore(vscode.window.activeTextEditor.selection.active) ? 1 : 0;
        const newSelection = new vscode.Selection(originalSelections[selection].anchor, vscode.window.activeTextEditor.selection.active.translate({characterDelta: delta}));
        newSelections.push(newSelection);
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "%": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelection = new vscode.Selection(
        new vscode.Position(0,0),
        utils.getEOF()
      );
      vscode.window.activeTextEditor.selections = [newSelection];
    }
  },
  "selectToLineBegin": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        let newStart = selection.active.translate({characterDelta: 1});
        let newEnd = selection.active.with({character: 0});
        newSelections.push(new vscode.Selection(newStart, newEnd));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "selectToLineBeginFull": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        let newStart = selection.anchor
        let newEnd = selection.active.with({character: 0});
        newSelections.push(new vscode.Selection(newStart, newEnd));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "selectToLineEnd": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        const lineLength = vscode.window.activeTextEditor.document.lineAt(selection.active.line).text.length;
        let newEnd = selection.active.translate({characterDelta: lineLength});
        let newStart = selection.active
        newSelections.push(new vscode.Selection(newStart, newEnd));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "selectToLineEndFull": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        const lineLength = vscode.window.activeTextEditor.document.lineAt(selection.active.line).text.length;
        let newEnd = selection.active.translate({characterDelta: lineLength});
        let newStart = selection.anchor
        newSelections.push(new vscode.Selection(newStart, newEnd));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  ";": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.resetCursor();
    }
  },
  "flipSelections": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        newSelections.push(new vscode.Selection(selection.active, selection.anchor));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "orientSelections": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        if (selection.anchor.isAfter(selection.active)) {
          newSelections.push(new vscode.Selection(selection.active, selection.anchor));
        } else {
          newSelections.push(selection);
        }
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  /*
  ** CHANGES (non-normal mode). Changing the buffer
  */
  "i": {
    repeatable: false,
    exec: (state: ModalState) => {
      // If the cursor is at the end of the selection instead of the front, swap the anchor and cursor
      let newSelection: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        if (selection.anchor.isBefore(selection.active)) {
          newSelection.push(new vscode.Selection(selection.active, selection.anchor));
        } else {
          newSelection.push(selection);
        }
      }
      vscode.window.activeTextEditor.selections = newSelection;
      state.setMode(Mode.Insert);
    }
  },
  "a": {
    repeatable: false,
    exec: (state: ModalState) => {
      // If the cursor is at the beginning of the selection instead of the end, swap the anchor and cursor
      let newSelection: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        if (selection.anchor.isEqual(selection.active)) {
          // If it's a single character selection, shift the cursor to the right
          const newPos = selection.active.with(selection.active.line, selection.active.character + 1);
          newSelection.push(new vscode.Selection(newPos, newPos));
        } else if (selection.anchor.isAfter(selection.active)) {
          newSelection.push(new vscode.Selection(selection.active, selection.anchor));
        } else {
          newSelection.push(selection);
        }
      }
      vscode.window.activeTextEditor.selections = newSelection;
      state.setMode(Mode.Insert);
    }
  },
  "d": {
    repeatable: false,
    exec: async (state: ModalState) => {
      for (let selection of vscode.window.activeTextEditor.selections) {
        await vscode.window.activeTextEditor.edit((textEdit) => {
          if (selection.isEmpty) {
            // If it's empty (one character), extend selection to delete
            let newPos = selection.active.translate({characterDelta: 1});
            textEdit.delete(new vscode.Selection(newPos, selection.active));
          } else {
            textEdit.delete(selection);
          }
        });
      }  
    }
  },
  /*
  ** GOTO commands
  */
  "g": {
    repeatable: false,
    exec: (state: ModalState, lineNumber: number) => {
      if (lineNumber) {
        let newPos = new vscode.Position(lineNumber - 1, 0);
        vscode.window.activeTextEditor.selections = [new vscode.Selection(newPos, newPos)];
      } else {
        state.setMode(Mode.Goto);
      }
    }
  },
  "G": {
    repeatable: false,
    exec: (state: ModalState, lineNumber: number) => {
      if (lineNumber) {
        let newPos = new vscode.Position(lineNumber - 1, 0);
        vscode.window.activeTextEditor.selections = [new vscode.Selection(vscode.window.activeTextEditor.selection.anchor, newPos)];
      } else {
        state.setMode(Mode.Goto);
      }
    }
  },
  "g:h": {
    repeatable: false,
    exec: async (state: ModalState) => {
      state.resetCursor();
      await vscode.commands.executeCommand('cursorHome');
    }
  },
  "G:h": {
    repeatable: false,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorHomeSelect');
    }
  },
  "g:l": {
    repeatable: false,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorEnd');
    }
  },
  "G:l": {
    repeatable: false,
    exec: async (state: ModalState) => {
      await vscode.commands.executeCommand('cursorEndSelect');
    }
  },
  "g:i": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        const idx = vscode.window.activeTextEditor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
        const newPos = new vscode.Position(selection.active.line, idx);
        newSelections.push(new vscode.Selection(newPos, newPos));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "G:i": {
    repeatable: false,
    exec: (state: ModalState) => {
      let newSelections: vscode.Selection[] = [];
      for (let selection of vscode.window.activeTextEditor.selections) {
        const idx = vscode.window.activeTextEditor.document.lineAt(selection.active.line).firstNonWhitespaceCharacterIndex;
        const newPos = new vscode.Position(selection.active.line, idx);
        newSelections.push(new vscode.Selection(selection.anchor, newPos));
      }
      vscode.window.activeTextEditor.selections = newSelections;
    }
  },
  "g:g": {
    repeatable: false,
    exec: (state: ModalState) => {
      const newPos = new vscode.Position(0,0);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(newPos, newPos)];
    }
  },
  "G:g": {
    repeatable: false,
    exec: (state: ModalState) => {
      const newPos = new vscode.Position(0,0);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(vscode.window.activeTextEditor.selection.anchor, newPos)];
    }
  },
  "g:k": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.processCommand('g:g');
    }
  },
  "G:k": {
    repeatable: false,
    exec: (state: ModalState) => {
      state.processCommand('G:g');
    }
  },
  "g:j": {
    repeatable: false,
    exec: (state: ModalState) => {
      const newPos = new vscode.Position(vscode.window.activeTextEditor.document.lineCount - 1, 0);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(newPos, newPos)];
    },
  },
  "G:j": {
    repeatable: false,
    exec: (state: ModalState) => {
      const newPos = new vscode.Position(vscode.window.activeTextEditor.document.lineCount - 1, 0);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(vscode.window.activeTextEditor.selection.anchor, newPos)];
    }
  },
  "g:e": {
    repeatable: false,
    exec: (state: ModalState) => {
      const finalLineNumber = vscode.window.activeTextEditor.document.lineCount - 1;
      const newPos = new vscode.Position(finalLineNumber, vscode.window.activeTextEditor.document.lineAt(finalLineNumber).text.length);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(newPos, newPos)];
    }
  },
  "G:e": {
    repeatable: false,
    exec: (state: ModalState) => {
      const finalLineNumber = vscode.window.activeTextEditor.document.lineCount - 1;
      const newPos = new vscode.Position(finalLineNumber, vscode.window.activeTextEditor.document.lineAt(finalLineNumber).text.length);
      vscode.window.activeTextEditor.selections = [new vscode.Selection(vscode.window.activeTextEditor.selection.anchor, newPos)];
    }
  }
}