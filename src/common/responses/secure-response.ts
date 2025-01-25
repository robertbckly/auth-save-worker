type Body = BodyInit | null;
type Options = ResponseInit;

export class SecureResponse extends Response {
  constructor(body?: Body, options?: Options) {
    super(body, options);

    // HSTS
    this.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

    // CORS (unnecessary now due to same origin)
    // this.headers.set('Access-Control-Allow-Origin', APP_URL);
    // this.headers.set('Access-Control-Allow-Credentials', 'true');
    // this.headers.set('Access-Control-Allow-Headers', CSRF_HEADER);

    // CORB / MIME type
    // (assuming API will only respond with JSON)
    this.headers.set('Content-Type', 'application/json');
    this.headers.set('X-Content-Type-Options', 'nosniff');

    // CORP
    this.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

    // No `Referer` (for the sake of it)
    this.headers.set('Referrer-Policy', 'no-referrer');
  }
}
