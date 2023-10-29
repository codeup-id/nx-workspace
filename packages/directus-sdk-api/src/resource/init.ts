/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CollectionType,
  DirectusClient,
  Query,
  ReadItemOutput,
  RegularCollections,
  RestClient,
} from '@directus/sdk';
import { ApiResRead, apiResRead } from './read';

export interface IBaseNormalizerFn<
  Schema extends object,
  C extends RegularCollections<Schema>,
  BaseFields extends QueryType<Schema, C>['fields']
> {
  (
    data: ReadItemOutput<Schema, C, { fields: BaseFields }>
    // data: ApplyQueryFields<
    //   ApiItemsSchema,
    //   CollectionItem<Collection>,
    //   BaseFields
    // >
  ): any;
}

type PathType = 'read' | 'create' | 'update' | 'delete';

export interface PathItemProps<
  Schema extends object,
  C extends RegularCollections<Schema>,
  Type extends PathType
> extends Omit<Query<Schema, CollectionType<Schema, C>>, 'fields'> {
  paths: string[];
}

type PathConfigFn<
  Schema extends object,
  C extends RegularCollections<Schema>,
  Type extends PathType
> = {
  (p: PathItemProps<Schema, C, Type>): any;
};

export interface IResource<
  Schema extends object,
  C extends RegularCollections<Schema>,
  QType extends QueryType<Schema, C>,
  BaseFields extends QType['fields'],
  BaseQuery extends Omit<QType, 'fields'>,
  BaseNormalizer extends IBaseNormalizerFn<Schema, C, BaseFields>,
  Paths extends Record<PathType, Record<string, any>> = Record<
    PathType,
    Record<string, any>
  >
> {
  collection: C;
  baseFields: BaseFields;
  baseQuery: BaseQuery;
  paths: Paths;
  baseNormalizer: BaseNormalizer;
  addPath: <
    Key extends string,
    Type extends PathType,
    Path extends PathConfigFn<Schema, C, Type>
  >(
    type: Type,
    key: Key,
    create: (res: this) => Path
  ) => this & {
    paths: {
      [T in Type]: {
        [key in Key]: (
          p: Partial<PathItemProps<Schema, C, Type>>
        ) => ReturnType<Path>;
      };
    };
  };
  read: ApiResRead<Schema, C, BaseFields, BaseQuery, BaseNormalizer>;
}

export type CreateResourceType<Schema extends object> = <
  C extends RegularCollections<Schema>,
  QType extends Query<Schema, CollectionType<Schema, C>>,
  BaseFields extends QType['fields'],
  BaseQuery extends Omit<QType, 'fields'>,
  BaseNormalizer extends IBaseNormalizerFn<Schema, C, BaseFields>
>(
  collection: C,
  config: {
    baseFields: BaseFields;
    baseQuery: BaseQuery;
    baseNormalizer: BaseNormalizer;
  }
) => IResource<Schema, C, QType, BaseFields, BaseQuery, BaseNormalizer>;

export function createResource<Schema extends object>(
  init: InitResourceOptions<Schema>
): CreateResourceType<Schema> {
  return (collection, { baseFields, baseQuery, baseNormalizer }) => {
    return {
      collection,
      baseFields,
      baseQuery,
      baseNormalizer,
      paths: {
        read: {
          asdda: {},
        },
        create: {},
        update: {},
        delete: {},
      },
      addPath(type, key, create) {
        const fn = (p: any) => {
          return create(this)(p);
        };
        this.paths[type] = { ...this.paths[type], ...{ [key]: fn } };
        return this;
      },
      get read() {
        return apiResRead({
          init,
          collection,
          baseFields,
          baseQuery,
          baseNormalizer,
        });
      },
    };
  };
}

export type QueryType<
  Schema extends object,
  C extends RegularCollections<Schema>
> = Query<Schema, CollectionType<Schema, C>>;

export type InitResourceOptions<Schema extends object> = {
  restClient: DirectusClient<Schema> & RestClient<Schema>;
  errorThrow?: (msg: string) => any;
};

type IInitResource<Schema extends object> = {
  create: CreateResourceType<Schema>;
};

export function initResource<Schema extends object>(
  init: InitResourceOptions<Schema>
): IInitResource<Schema> {
  if (!init.errorThrow)
    init.errorThrow = (msg: string) => {
      throw new Error(msg);
    };
  const create = (...p: Parameters<CreateResourceType<Schema>>) => {
    return createResource(init)(...p);
  };
  return {
    // @ts-ignore
    create,
  };
}
