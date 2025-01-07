/*
  Wrapper for the sake of decoupling app implementation from 
  infrastructure / data architecture
 */

type BaseArgs = { env: Env; key: string };
type GetObjectArgs = BaseArgs;
type PutObjectArgs = BaseArgs & { value: string };

export const getObject = async ({ env, key }: GetObjectArgs) => {
  return await env.bucket.get(key);
};

export const putObject = async ({ env, key, value }: PutObjectArgs) => {
  return await env.bucket.put(key, value);
};
