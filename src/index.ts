export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(`Hello :-) ${request.url}`, { status: 200 });
  },
};
