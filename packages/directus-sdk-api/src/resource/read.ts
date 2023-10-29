/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ClientOptions,
  RegularCollections,
  aggregate,
  readItems,
} from '@directus/sdk';
import { IBaseNormalizerFn, InitResourceOptions, QueryType } from './init';

export interface ApiResRead<
  Schema extends object,
  C extends RegularCollections<Schema>,
  BaseFields extends QueryType<Schema, C>['fields'],
  BaseQuery extends QueryType<Schema, C>,
  BaseNormalizer extends IBaseNormalizerFn<Schema, C, BaseFields>
> {
  clientOptions(o: ClientOptions): this;
  setQuery: (query: Omit<QueryType<Schema, C>, 'fields'>) => this;
  items: <
    Fields extends QueryType<Schema, C>['fields'],
    Normalizer extends IBaseNormalizerFn<Schema, C, Fields>,
    Meta extends boolean = false,
    Single extends boolean = false,
    ReturnNormalized = ReturnType<
      Fields extends any[] ? Normalizer : BaseNormalizer
    >,
    Data = Single extends true ? ReturnNormalized : ReturnNormalized[]
  >(p: {
    normalizer?: [Fields, Normalizer];
    meta?: Meta;
    single?: Single;
  }) => Promise<
    Meta extends true
      ? {
          data: Data;
          meta: {
            total_count: number;
            filter_count: number;
            limit: number;
            page: number;
          };
        }
      : Data
  >;
}

export function apiResRead<
  Schema extends object,
  C extends RegularCollections<Schema>,
  QType extends QueryType<Schema, C>,
  BaseFields extends QType['fields'],
  BaseQuery extends Omit<QType, 'fields'>,
  BaseNormalizer extends IBaseNormalizerFn<Schema, C, BaseFields>
>({
  init,
  collection,
  baseFields,
  baseQuery,
  baseNormalizer,
}: {
  init: InitResourceOptions<Schema>;
  collection: C;
  baseFields: BaseFields;
  baseQuery: BaseQuery;
  baseNormalizer: BaseNormalizer;
}): ApiResRead<Schema, C, BaseFields, BaseQuery, BaseNormalizer> {
  let { limit, page, filter, sort, search } = { ...baseQuery };
  let clientOptions: ClientOptions = {};
  return {
    clientOptions(o) {
      clientOptions = o;
      return this;
    },
    setQuery(_query) {
      if (_query.limit) limit = _query.limit;
      if (_query.page) page = _query.page;
      if (baseQuery.filter && _query.filter) {
        filter = { _and: [baseQuery.filter, _query.filter] };
      } else {
        if (_query.filter) filter = _query.filter;
      }
      if (_query.sort) sort = _query.sort;
      if (_query.search) search = _query.search;
      return this;
    },
    // @ts-ignore
    async items({ normalizer, meta, single }) {
      const fields = normalizer?.[0] ? normalizer[0] : baseFields;
      const newQuery: any = {
        fields,
        filter,
      };
      if (limit) newQuery.limit = limit;
      if (page) newQuery.page = page;
      if (sort) newQuery.sort = sort;
      if (search) newQuery.search = search;
      const query = {
        ...{ limit: 10, page: 1 },
        ...baseQuery,
        ...newQuery,
      };
      const client = init.restClient;
      const data = await client.request(readItems(query));
      let dataNormalized = data.map(
        // @ts-ignore
        normalizer ? normalizer[1] : baseNormalizer
      );
      if (single) {
        if (!dataNormalized[0]) {
          init.errorThrow?.('Tidak ada data');
        }
        dataNormalized = dataNormalized[0];
      }
      if (meta === true) {
        const _countAll = await client.request(
          aggregate(collection, { aggregate: { count: '*' } })
        );

        const _countFilter = await client.request(
          aggregate(collection, {
            aggregate: { count: '*' },
            query: { filter, search },
          })
        );
        const countAll =
          _countAll.length && _countAll[0] && _countAll[0].count
            ? parseInt(_countAll[0].count)
            : 0;
        const countFilter =
          _countFilter.length && _countFilter[0] && _countFilter[0].count
            ? parseInt(_countFilter[0].count)
            : 0;
        return {
          data: dataNormalized,
          meta: {
            total_count: countAll,
            filter_count: countFilter,
            limit: query.limit,
            page: query.page,
          },
        };
      }
      return dataNormalized;
    },
  };
}
