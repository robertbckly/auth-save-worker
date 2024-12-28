export default {
  async fetch(request) {
    return new Response(`Hello :-) ${request.url}`, { status: 200 });
  },
} satisfies ExportedHandler<Env>;
