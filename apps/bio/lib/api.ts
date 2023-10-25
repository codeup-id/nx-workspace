import {
  authentication,
  createDirectus,
  rest,
  staticToken,
  withToken,
} from '@directus/sdk';

export const client = createDirectus(process.env.BACKEND_URL!)
  // .with(staticToken(process.env.BACKEND_TOKEN!))
  .with(rest());


export const apiClient = createDirectus(process.env.BACKEND_URL!)
  .with(staticToken(process.env.BACKEND_TOKEN!))
  .with(rest());

