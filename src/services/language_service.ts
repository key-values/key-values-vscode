import { KeyValuesDocumentSymbols } from "./document_symbols";
import { TextDocument, DocumentSymbol } from "vscode-languageserver";
import { KeyValuesDocument } from "key-values-ts";
import { ASTNode } from "key-values-ts/lib/ast_node";

export interface LanguageService {
  parseKeyValuesDocument(document: TextDocument): KeyValuesDocument;
  newKeyValuesDocument(rootNode: ASTNode): KeyValuesDocument;
  findDocumentSymbols(
    textDoc: TextDocument,
    vdfDoc: KeyValuesDocument
  ): DocumentSymbol[];
}

export function getLanguageService(): LanguageService {
  const vdfDocumentSymbols = new KeyValuesDocumentSymbols();

  return {
    parseKeyValuesDocument: (document: TextDocument) =>
      KeyValuesDocument.fromText(document.getText()),
    newKeyValuesDocument: (rootNode: ASTNode) =>
      new KeyValuesDocument(rootNode),
    findDocumentSymbols: vdfDocumentSymbols.findDocumentSymbols.bind(
      vdfDocumentSymbols
    ),
  };
}
