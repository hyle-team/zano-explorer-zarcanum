import { Request, Response, NextFunction } from 'express';

const exceptionHandler =
	(fn: (_req: Request, _res: Response, _next: NextFunction) => void) =>
	(req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch((e) => {
			console.log(e);

			next();
		});
	};

export default exceptionHandler;
