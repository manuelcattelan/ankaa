import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { AST_NODE_TYPES, ASTUtils } from "@typescript-eslint/utils";
import path from "node:path";

import { createRule } from "#/utilities/create-rule.ts";

type ExportedName = {
  isType: boolean;
  name: string;
  node: TSESTree.Node;
};

type FilenameMatchExportContext = Readonly<
  TSESLint.RuleContext<FilenameMatchExportMessageId, []>
>;

type FilenameMatchExportMessageId = "unexpectedFilename";

type GetExportedNamesOptions = {
  context: FilenameMatchExportContext;
  statement: TSESTree.ProgramStatement;
};

type GetSpecifierExportedNameOptions = {
  context: FilenameMatchExportContext;
  isType: boolean;
  specifier: TSESTree.ExportSpecifier;
};

const typeDeclarationTypes = new Set<string>([
  AST_NODE_TYPES.TSInterfaceDeclaration,
  AST_NODE_TYPES.TSTypeAliasDeclaration,
]);

export const filenameMatchExport = createRule({
  create: (context) => ({
    Program: (program) => {
      const exportedNames = program.body.flatMap((statement) =>
        getExportedNames({ context, statement }),
      );
      const valueExportedNames = exportedNames.filter(
        (exportedName) => !exportedName.isType,
      );
      const typeExportedNames = exportedNames.filter(
        (exportedName) => exportedName.isType,
      );
      const namingExportedName =
        valueExportedNames.length > 0
          ? getOnlyExportedName(valueExportedNames)
          : getOnlyExportedName(typeExportedNames);

      if (!namingExportedName) {
        return;
      }

      const expectedFilename = convertToKebabCase(namingExportedName.name);
      const filename = path.basename(context.filename).split(".").at(0);

      if (filename !== expectedFilename) {
        context.report({
          data: { expectedFilename, exportedName: namingExportedName.name },
          messageId: "unexpectedFilename",
          node: namingExportedName.node,
        });
      }
    },
  }),
  defaultOptions: [],
  meta: {
    docs: {
      description:
        "Name a file in kebab-case after its one value export, or after its one type export when it exports no value.",
    },
    messages: {
      unexpectedFilename:
        'Name this file "{{expectedFilename}}" after its one export {{exportedName}}, so a search for an export finds its file. A file that groups several exports is named after the concept they share.',
    },
    schema: [],
    type: "suggestion",
  },
  name: "filename-match-export",
});

function convertToKebabCase(name: string) {
  return name
    .replaceAll(/([\da-z])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replaceAll("_", "-")
    .toLowerCase();
}

function getDeclarationExportedNames(
  declaration: TSESTree.NamedExportDeclarations,
) {
  const isType = typeDeclarationTypes.has(declaration.type);

  if (declaration.type === AST_NODE_TYPES.VariableDeclaration) {
    return declaration.declarations.flatMap((declarator) =>
      declarator.id.type === AST_NODE_TYPES.Identifier
        ? [{ isType, name: declarator.id.name, node: declarator.id }]
        : [],
    );
  }

  if (
    "id" in declaration &&
    declaration.id?.type === AST_NODE_TYPES.Identifier
  ) {
    return [{ isType, name: declaration.id.name, node: declaration.id }];
  }

  return [];
}

function getExportedNames({ context, statement }: GetExportedNamesOptions) {
  if (statement.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
    return [];
  }

  const isType = statement.exportKind === "type";

  const exportedNames: ExportedName[] = statement.declaration
    ? getDeclarationExportedNames(statement.declaration).map(
        (exportedName) => ({
          ...exportedName,
          isType: isType || exportedName.isType,
        }),
      )
    : statement.specifiers.map((specifier) =>
        getSpecifierExportedName({ context, isType, specifier }),
      );

  return exportedNames;
}

function getOnlyExportedName(exportedNames: ExportedName[]) {
  return exportedNames.length === 1 ? exportedNames.at(0) : undefined;
}

function getSpecifierExportedName({
  context,
  isType,
  specifier,
}: GetSpecifierExportedNameOptions) {
  const name =
    specifier.exported.type === AST_NODE_TYPES.Identifier
      ? specifier.exported.name
      : specifier.exported.value;
  const localName =
    specifier.local.type === AST_NODE_TYPES.Identifier
      ? specifier.local.name
      : specifier.local.value;
  const variable = ASTUtils.findVariable(
    context.sourceCode.getScope(specifier),
    localName,
  );
  const isTypeVariable =
    variable !== null &&
    "isValueVariable" in variable &&
    !variable.isValueVariable;

  return {
    isType: isType || specifier.exportKind === "type" || isTypeVariable,
    name,
    node: specifier,
  };
}
