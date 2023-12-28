import { io } from 'socket.io-client';
import { SERVER_PORT_DEV } from '../config/config';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : `http://localhost:${SERVER_PORT_DEV}`;

// @ts-ignore
export const socket = io(URL);