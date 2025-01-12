/*
  Wrapper for the sake of decoupling app implementation from 
  infrastructure / data architecture
 */

type BaseParams = { env: Env; key: string };
type GetObjectParams = BaseParams;
type PutObjectParams = BaseParams & { value: string };

export const getObject = async ({ env, key }: GetObjectParams) => {
  return await env.bucket.get(key);
};

export const putObject = async ({ env, key, value }: PutObjectParams) => {
  return await env.bucket.put(key, value);
};
