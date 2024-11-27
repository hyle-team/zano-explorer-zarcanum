import "dotenv/config";

export const ZANO_ASSET_ID = 'd6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a';

export const config = {
    "api": process.env.API + '/json_rpc',
    "frontend_api": process.env.FRONTEND_API,
    "server_port": process.env.SERVER_PORT,
    "auditable_wallet": {
        "api":  process.env.AUDITABLE_WALLET_API + '/json_rpc',
    },
    "assets_whitelist_url": process.env.ASSETS_WHITELIST_URL,
    "websocket": {
        "enabled_during_sync": process.env.WEBSOCKET_ENABLED_DURING_SYNC === "true"
    },
    "enableVisibilityInfo": process.env.ENABLE_VISIBILITY_INFO === "true",
    "maxDaemonRequestCount": parseInt(process.env.MAX_DAEMON_REQUEST_COUNT || "", 10) || 1000,
    "matrix_api_url": process.env.MATRIX_API_URL
}

export function log(msg: string) {
    const now = new Date()

    console.log(
        now.getFullYear() +
        '-' +
        now.getMonth() +
        '-' +
        now.getDate() +
        ' ' +
        now.getHours() +
        ':' +
        now.getMinutes() +
        ':' +
        now.getSeconds() +
        '.' +
        now.getMilliseconds() +
        ' ' +
        msg
    )
}
export const parseComment = (comment) => {
    let splitComment = comment.split(/\s*,\s*/).filter((el) => !!el)
    let splitResult = splitComment[4]
    if (splitResult) {
        let result = splitResult.split(/\s*"\s*/)
        let input = result[3].toString()
        if (input) {
            let output = Buffer.from(input, 'hex')
            return output.toString()
        } else {
            return ''
        }
    } else {
        return ''
    }
}

export const parseTrackingKey = (trackingKey) => {
    let splitKey = trackingKey.split(/\s*,\s*/)
    let resultKey = splitKey[5]
    if (resultKey) {
        let key = resultKey.split(':')
        let keyValue = key[1].replace(/\[|\]/g, '')
        if (keyValue) {
            return keyValue.toString().replace(/\s+/g, '')
        } else {
            return ''
        }
    } else {
        return ''
    }
}

export const decodeString = (str) => {
    if (!!str) {
        str = str.replace(/'/g, "''")
        // eslint-disable-next-line no-control-regex
        return str.replace(/\u0000/g, '', (unicode) => {
            return String.fromCharCode(
                parseInt(unicode.replace(/\\u/g, ''), 16)
            )
        })
    }
    return str
}
