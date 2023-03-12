import { SecureServer } from "@dt-esa/secure-webserver";

import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { environment } from './environment';

import { ErrorHandler } from './errors';
import { FilesystemApi } from "./api/files";
import { SocketService } from "./pty";
import { XOrgApi } from './api/xorg';

(async () => {

    // let RedisStore = connectRedis(session);
    // const rStore = new RedisStore({
    //     logErrors: true,
    //     prefix: "session-",
    //     pass: process.env["REDIS_PASSWORD"],
    //     client: new Redis({
    //         host: "localhost",
    //         port: 6379,
    //         password: process.env["REDIS_PASSWORD"],
    //         timeout: 400
    //     }),
    //     ttl: 3600// 1 hour
    // });

    // const sessionHandler = session({
    //     secret: process.env["SESSION_SECRET"] || 'keyboard cat',
    //     resave: false,
    //     saveUninitialized: false,
    //     cookie: {
    //         path: "/",
    //         sameSite: "lax",
    //         secure: false
    //     },
    //     store: rStore,
    //     unset: "destroy"
    // });

    const server = new SecureServer({
        // Disable SSL termination in kubernetes.
        // disableSSL: !!process.env['KUBERNETES_PORT'],
        // sessionHandler: sessionHandler as any,
        port: environment.port,
        errorHandler: false,
        domain: environment.domain,
        title: "Osiris System",
        timeout: Number.MAX_SAFE_INTEGER,
        description: "Main client interface for Osiris NAS",
        accessLog: morgan((tokens, req, res) => {
            const status = tokens.status(req, res);
            const sc = status >= 500 ? 31 : status >= 400 ? 33 : status >= 300 ? 36 : status >= 200 ? 32 : 0;
            const format = [
                `\x1b[32m`,
                tokens.date('web'),
                `\x1b[0m(\x1b[34m${(
                    req.session && (
                        req.session['userinfo']?.upn ||
                        req.session['userinfo']?.mail
                    )) ||
                'anonymous'
                }\x1b[0m)`,
                '-',
                `(\x1b[${sc}m${tokens.method(req, res)}/${status}\x1b[0m)`,
                `\x1b[90m${tokens.url(req, res)}\x1b[0m`,
                '-',
                tokens['response-time'](req, res),
                'ms -',
                (res.get("content-length") || '-'),
                `b\x1b[0m`
            ].join(' ');
            // console.log(format);
            return format;
        }, {}) as any,
        startupDirectories: [
            "data",
            "client",
            "assets",
            "log"
        ],
        helmet: false
    });

    const app: Express = server.getApp();

    app.use(helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "default-src": ["'self'",],
            "frame-ancestors": ["'self'"],
            "frame-src": ["'self'"],
            "font-src": ["'self'", "data:"],
            "form-action": ["'self'"],
            "img-src": ["*", "data:"],
            "media-src": ["'self'", "blob:" ],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "script-src-attr": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            // "report-uri": ["/api/Security/Violation"],
            "worker-src": ["'self'", "blob:"]
        }
    }));
    app.use(helmet.dnsPrefetchControl({ allow: false }));
    app.use(helmet.frameguard({ action: "sameorigin" }));
    app.use(helmet.hidePoweredBy());
    // app.use(helmet.hsts({ maxAge: 86400 * 7 }));
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());

    // Cache policies
    app.use((req, res, next) => {
        const cacheAge =
            /\.(png|jpe?g|gif|svg|tiff|woff2?|wav|tff)/.test(req.url) ? "private, max-age=31536000" : // 365 days
            /\.(css|js|html?|json)/.test(req.url) ? "private, max-age=86400" // 1 day
                : "no-cache" // do not cache

        res.setHeader("Cache-Control", cacheAge);

        res.setHeader("Access-Control-Allow-Origin", environment.domain);
        res.setHeader("X-Content-Type-Options", "nosniff");

        next();
    });

    // Serve static assets in 'client' directory
    app.use(express.static(__dirname + '/../client/'));

    app.use("/api/filesystem", FilesystemApi);
    app.use("/api/xorg", XOrgApi);

    app.use((req, res, next) => next(404));
    app.use(ErrorHandler);

    // Listen on the specified port.
    await server.start();
    const httpserver = server.getServer();
    const socketService = new SocketService();

    // We are going to pass server to socket.io in SocketService.js
    socketService.attachServer(httpserver);
})();
