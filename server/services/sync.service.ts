import Alias from "../schemes/Alias";
import rpcService from "./rpc.service";

class SyncService {
    async syncAliases() {
        console.log('fetching all alias details from daemon...');
        const allAliases = await rpcService.getAllAliasesDetails();
        console.log(`Fetched ${allAliases.length} aliases from daemon.`);
        
        const preparedData = allAliases.map(e => ({
            alias: e.alias,
            address: e.address,
            comment: e.comment,
            tracking_key: e.tracking_key,
            block: null,
            transaction: null,
            enabled: 1
        }));

        Alias.bulkCreate(preparedData, {
            ignoreDuplicates: true,
        })
    }
}

const syncService = new SyncService();

export default syncService;