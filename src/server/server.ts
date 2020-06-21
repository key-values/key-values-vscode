import {
  Connection,
  TextDocuments,
  InitializeParams,
  InitializeResult,
  ServerCapabilities,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { getLanguageService } from "../services/language_service";
import { getLanguageModelCache } from "./language_model_cache";
import { KeyValuesDocument } from "key-values-ts";

export function startServer(
  connection: Connection,
) {
  // Create KeyValues language service
  let languageService = getLanguageService();

  // Create new text document manager
  const textDocs = new TextDocuments(TextDocument);

  // Listen for open, change and close text document events
  textDocs.listen(connection);

  connection.onInitialize(
    (params: InitializeParams): InitializeResult => {
      const capabilities: ServerCapabilities = {
        documentSymbolProvider: true,
      };

      return { capabilities };
    }
  );

  const vdfDocs = getLanguageModelCache<KeyValuesDocument>(10, 120, (textDoc) =>
    languageService.parseKeyValuesDocument(textDoc)
  );

  textDocs.onDidClose((e) => {
    vdfDocs.onDocumentRemoved(e.document);
  });
  connection.onShutdown(() => {
    vdfDocs.dispose();
  });

  function getKeyValuesDocument(textDoc: TextDocument): KeyValuesDocument {
    return vdfDocs.get(textDoc);
  }

  connection.onDocumentSymbol((documentSymbolParams, token) => {
    const textDoc = textDocs.get(documentSymbolParams.textDocument.uri);
    if (textDoc) {
      const vdfDoc = getKeyValuesDocument(textDoc);
      return languageService.findDocumentSymbols(textDoc, vdfDoc);
    }
    return [];
  });

  // Listen on the connection
  connection.listen();
}
