import Block from "../interfaces/state/Block";

class Utils {
    static formatTimestampUTC(timestamp: number) {
        const date = new Date(timestamp * 1e3);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    static formatNumber(number: number | string, decimalPlaces: number = 2): string {
        const parsedNumber = typeof number === "number" ? number : parseFloat(number) || 0;
        const roundedNumber = parsedNumber.toFixed(decimalPlaces);
        const [integerPart, decimalPart] = roundedNumber.split(".");
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        const formattedNumber = formattedIntegerPart + (decimalPlaces > 0 ? "." + decimalPart : "");
        return formattedNumber;
    }

    static toShiftedNumber(string: string, shift: number = 2, decimalShown: boolean = true) {
        if (typeof string !== "string") return "";
        const input = string.replace(/\D/g, "");
        const length = input.length;

        if (shift > length) {
            return "0." + ("0".repeat(shift - length) + input).slice(0, 2);
        }

        const delimitedCharIndex = Math.max(0, length - shift);
        const integerPart = input.slice(0, delimitedCharIndex) || '0';
        const decimalPart = decimalShown ? input.slice(delimitedCharIndex, length) + "00" : "";

        return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (decimalPart ? "." + decimalPart.slice(0, 2) : "");
    }

    static transformToBlocks(result: any, reverse: boolean = false, hashField: boolean = false): Block[] {
        if (result.sucess === false) return [];
        if (!(result instanceof Array)) return [];
        return (reverse ? result.reverse() : result).map((e: any) => ({
            height: e.height,
            type: e.type === 0 ? "PoS" : "PoW",
            timestamp: parseInt(e.timestamp, 10),
            size: e.total_txs_size,
            transactions: e.tr_count,
            hash: !hashField ? e.id : e.hash
        } as Block));
    }

    static timeElapsedString(timestamp: number): string {
        const currentTimestamp: number = Date.now() / 1000;
        const elapsedSeconds: number = currentTimestamp - timestamp;

        if (elapsedSeconds < 60) {
            return "just now";
        } else if (elapsedSeconds < 3600) {
            const minutes: number = Math.floor(elapsedSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (elapsedSeconds < 86400) {
            const hours: number = Math.floor(elapsedSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (elapsedSeconds < 31536000) {
            const days: number = Math.floor(elapsedSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            const years: number = Math.floor(elapsedSeconds / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    }
}

export default Utils;