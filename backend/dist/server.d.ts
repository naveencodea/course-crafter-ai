import http from 'http';
import { Server } from 'socket.io';
declare const app: import("express-serve-static-core").Express;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
declare const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
export { app, io, server };
