export class CustomResponse<T = any> {
    public body: string;
    public status: number;
    public headers: { [key: string]: string };

    constructor(body: T, options: { status?: number; headers?: { [key: string]: string } } = {}) {
        this.body = JSON.stringify(body);
        this.status = options.status || 200;
        this.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
    }

    // Convert to a standard Response object
    public toStandardResponse(): Response {
        return new Response(this.body, {
            status: this.status,
            headers: this.headers,
        });
    }

    public static ok<T>(data: T, headers?: { [key: string]: string }): CustomResponse<T> {
        return new CustomResponse(data, { status: 200, headers });
    }

    public static created<T>(data: T, headers?: { [key: string]: string }): CustomResponse<T> {
        return new CustomResponse(data, { status: 201, headers });
    }

    public static badRequest(message: string, headers?: { [key: string]: string }): CustomResponse<{ error: string }> {
        return new CustomResponse({ error: message }, { status: 400, headers });
    }

    public static unauthorized(message: string, headers?: { [key: string]: string }): CustomResponse<{ error: string }> {
        return new CustomResponse({ error: message }, { status: 401, headers });
    }

    public static forbidden(message: string, headers?: { [key: string]: string }): CustomResponse<{ error: string }> {
        return new CustomResponse({ error: message }, { status: 403, headers });
    }

    public static notFound(message: string, headers?: { [key: string]: string }): CustomResponse<{ error: string }> {
        return new CustomResponse({ error: message }, { status: 404, headers });
    }

    public static internalServerError(message: string, headers?: { [key: string]: string }): CustomResponse<{ error: string }> {
        return new CustomResponse({ error: message }, { status: 500, headers });
    }
}
