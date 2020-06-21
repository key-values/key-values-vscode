import { KeyValuesDocument, ASTNodes } from "key-values-ts";
import {
  ColorPresentation,
  Color,
  ColorInformation,
  DocumentSymbol,
  SymbolInformation,
  SymbolKind,
  Range,
  Location,
  Position,
} from "vscode-languageserver-types";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  ASTNode,
  ObjectASTNode,
  NodePosition,
  PropertyASTNode,
} from "key-values-ts/lib/ast_node";

export class KeyValuesDocumentSymbols {
  public findDocumentSymbols(
    textDoc: TextDocument,
    vdfDoc: KeyValuesDocument
  ): DocumentSymbol[] {
    const root = vdfDoc.root;
    if (!root) {
      return [];
    }

    const result: DocumentSymbol[] = [];

    const toVisit: { node: ASTNode; result: DocumentSymbol[] }[] = [
      { node: root, result },
    ];

    let nextToVisit = 0;

    const collectOutlineEntries = (
      node: ASTNode,
      result: DocumentSymbol[]
    ): void => {
      if (node.type === "object") {
        const obj = node as ObjectASTNode;

        obj.properties.forEach((property) => {
          if (property.pos && property.keyNode.pos) {
            const location = Location.create(
              textDoc.uri,
              createRange(property.pos)
            );
            const range = createRange(property.pos);
            const selectionRange = createRange(property.keyNode.pos);
            const symbol = {
              name: this.getKeyLabel(property),
              kind: this.getSymbolKind(property.valueNode),
              range,
              selectionRange,
              children: [],
            };
            result.push(symbol);
            toVisit.push({
              result: symbol.children,
              node: property.valueNode,
            });
          }
        });
      }
    };

    while (nextToVisit < toVisit.length) {
      const next = toVisit[nextToVisit++];
      collectOutlineEntries(next.node, next.result);
    }

    return result;
  }

  private getSymbolKind(node: ASTNode): SymbolKind {
    switch (node.type) {
      case "object":
        return SymbolKind.Method;
      case "string":
        return SymbolKind.String;
      default:
        return SymbolKind.Variable;
    }
  }

  private getKeyLabel(property: PropertyASTNode): string {
    let name = property.keyNode.value;
    if (name) {
      name = name.replace(/[\n]/g, "↵");
    }
    if (name && name.trim()) {
      return name;
    }
    return `"${name}"`;
  }
}

/** Converts a NodePosition to a Range. */
function createRange(pos: NodePosition) {
  return Range.create(
    Position.create(pos.rowBegin, pos.columnBegin),
    Position.create(pos.rowEnd, pos.columnEnd)
  );
}
