import http from 'http';
import { Server } from 'socket.io';
declare const app: import("express-serve-static-core").Express;
declare const httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { app, httpServer, io };
