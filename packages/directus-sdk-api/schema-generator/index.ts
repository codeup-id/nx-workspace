import { writeFileSync } from 'fs';
import * as pluralize from 'pluralize';
import { Field, Collection, Relation } from '@directus/types';
import {
  createDirectus,
  rest,
  schemaSnapshot,
  staticToken,
} from '@directus/sdk';

function upperCamelCase(value: string) {
  return value
    .split('_')
    .map((part) => part[0].toUpperCase() + part.substring(1).toLowerCase())
    .join('');
}
function interfaceName(str: string): string {
  return upperCamelCase(pluralize.singular(str));
}

function fieldTypeToJsType(field: Field): string {
  switch (field.type) {
    case 'boolean':
      return 'boolean';
    case 'integer':
    case 'float':
    case 'decimal':
    case 'bigInteger':
      return 'number';
    case 'dateTime':
    case 'date':
    case 'time':
    case 'timestamp':
      // TODO: Validate this
      return 'string';
    case 'text':
    case 'string':
    case 'uuid':
    case 'hash':
      return 'string';
    case 'json':
      return 'any';
    case 'csv':
      return 'string[]';
    case 'alias':
    case 'binary':
    case 'geometry':
    case 'geometry.Point':
    case 'geometry.LineString':
    case 'geometry.Polygon':
    case 'geometry.MultiPoint':
    case 'geometry.MultiLineString':
    case 'geometry.MultiPolygon':
    case 'unknown':
    default:
      return 'never';
  }
}

async function run() {
  const outFile = process.argv[2] ?? 'api-schemas.d.ts';

  const client = createDirectus(process.argv[3] ?? process.env.BASE_URL_BACKEND)
    .with(staticToken(process.argv[4] ?? process.env.BACKEND_TOKEN))
    .with(rest());

  const schemas = await client.request(schemaSnapshot());

  const {
    collections,
    relations,
    fields,
  }: {
    collections: (Collection & { fields: Field[] })[];
    relations: Relation[];
    fields: Field[];
  } = schemas as any;

  collections.forEach((c, i) => {
    collections[i].fields = fields.filter((f) => f.collection === c.collection);
  });
  let interfacesSource = ``;
  const directusSdkImports = [
    'CompleteSchema',
    'MergeCoreCollection',
    'CoreSchema',
  ];

  function buildField(field: Field) {
    if (field.type === 'alias') {
      return '';
    }
    let type;
    const relation = relations.find(
      (r) => r.collection === field.collection && r.field === field.field
    );
    if (relation && relation.related_collection) {
      const targetClassName = interfaceName(relation.related_collection);
      if (!directusSdkImports.find((_i) => _i === targetClassName))
        directusSdkImports.push(targetClassName);
      const keyType = relation?.schema?.foreign_key_column
        ? `${targetClassName}<Schemas>["${relation.schema.foreign_key_column}"]`
        : fieldTypeToJsType(field);
      type = `${targetClassName}<Schemas> | ${keyType}`;
    } else if (field.meta?.options?.choices?.length) {
      // this is an enum with fixed choices!
      type = field.meta?.options?.choices
        ?.map((choice) => `'${choice.value.replaceAll("'", "\\'")}'`)
        ?.join(' | ');

      // add array type in case of multi-selection
      if (field?.meta?.interface?.includes('multiple')) {
        type = `(${type})[]`;
      }
    } else {
      type = fieldTypeToJsType(field);
    }
    if (field.schema?.is_nullable && !field.meta?.required) {
      type += ' | null';
    }

    return `  ${field.field}: ${type};\n`;
  }
  function buildFields(fields: Field[]) {
    let _meta = ``,
      _base = ``;
    fields.forEach((f) => {
      const _buildedField = buildField(f);
      if (
        f.field.match('id|date_created|date_updated|user_created|user_updated')
      ) {
        _meta += _buildedField;
      } else {
        _base += _buildedField;
      }
    });
    return `${_meta}\n${_base}`;
  }
  collections.forEach((collection) => {
    const iName = interfaceName(collection.collection);
    interfacesSource += `export interface ${iName}{\n${buildFields(
      collection.fields
    )}}`;
  });
  const overrides: Record<string, Field[]> = {};
  fields.forEach((f) => {
    if (f.collection.startsWith('directus_')) {
      if (!overrides[f.collection]) overrides[f.collection] = [];
      overrides[f.collection].push(f);
    }
  });
  const source = `import {${directusSdkImports.join(
    ', '
  )}} from '@directus/sdk';

${interfacesSource}

type Schemas = CompleteSchema<{
${collections
  .map((c) => {
    return `  ${c.collection}: ${interfaceName(c.collection)}${
      c.meta?.singleton ? '' : '[]'
    }`;
  })
  .join(';\n')};
${Object.keys(overrides).map((k) => {
  return `  ${k}: MergeCoreCollection<
  CoreSchema,
  '${k}',
  {${buildFields(overrides[k])}}
>;`;
})}
}>
export default Schemas;
  `;
  writeFileSync(outFile, source);
}
run();
