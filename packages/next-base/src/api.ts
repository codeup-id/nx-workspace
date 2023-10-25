import {
  ClientOptions,
  RestConfig,
  authentication,
  createDirectus,
  rest,
  staticToken,
} from '@directus/sdk';
import Schemas from './api-schemas';
import { BACKEND_TOKEN, BASE_URL_BACKEND_INTERNAL } from './init';

export const directusClientBase = (options?: ClientOptions) =>
  createDirectus<Schemas>(BASE_URL_BACKEND_INTERNAL, options);

export const directusClientAuthenticationJson = (options?: ClientOptions) =>
  directusClientBase(options).with(authentication('json'));

type DirectusClientWithRestOptions = {
  client?: ClientOptions;
  rest?: Partial<RestConfig>;
};
export const directusClientRest = (options?: DirectusClientWithRestOptions) =>
  directusClientBase(options?.client).with(rest(options?.rest));

export const directusClientBackendRest = (
  options?: DirectusClientWithRestOptions
) => directusClientRest(options).with(staticToken(BACKEND_TOKEN));
