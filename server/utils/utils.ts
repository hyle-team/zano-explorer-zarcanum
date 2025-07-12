import 'dotenv/config';

export const ZANO_ASSET_ID = 'd6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a';

export const config = {
	api: `${process.env.API}/json_rpc`,
	frontend_api: process.env.FRONTEND_API,
	server_port: process.env.SERVER_PORT,
	auditable_wallet: {
		api: `${process.env.AUDITABLE_WALLET_API}/json_rpc`,
	},
	assets_whitelist_url: process.env.ASSETS_WHITELIST_URL,
	websocket: {
		enabled_during_sync: process.env.WEBSOCKET_ENABLED_DURING_SYNC === 'true',
	},
	enableVisibilityInfo: process.env.ENABLE_VISIBILITY_INFO === 'true',
	maxDaemonRequestCount: parseInt(process.env.MAX_DAEMON_REQUEST_COUNT || '', 10) || 1000,
	trade_api_url: process.env.TRADE_API_URL,
	matrix_api_url: process.env.MATRIX_API_URL,
	mexc_api_url: process.env.MEXC_API_URL,
};

export function log(msg: string) {
	const now = new Date();

	console.log(
		`${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()} ${
			msg
		}`,
	);
}
export const parseComment = (comment: string) => {
	const splitComment = comment.split(/\s*,\s*/).filter((el) => !!el);
	const splitResult = splitComment[4];
	if (splitResult) {
		const result = splitResult.split(/\s*"\s*/);
		const input = result[3].toString();
		if (input) {
			const output = Buffer.from(input, 'hex');
			return output.toString();
		}
		return '';
	}
	return '';
};

export const parseTrackingKey = (trackingKey: string) => {
	const splitKey = trackingKey.split(/\s*,\s*/);
	const resultKey = splitKey[5];
	if (resultKey) {
		const key = resultKey.split(':');
		const keyValue = key[1].replace(/\[|\]/g, '');
		if (keyValue) {
			return keyValue.toString().replace(/\s+/g, '');
		}
		return '';
	}
	return '';
};

export const decodeString = (input: unknown): string | undefined => {
	if (typeof input !== 'string') return undefined;

	const replacedQuotes = input.replace(/'/g, "''");

	const cleaned = replacedQuotes.split('\x00').join('');

	return cleaned;
};

export const pause = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
