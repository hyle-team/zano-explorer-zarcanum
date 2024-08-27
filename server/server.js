
// API
app.use(express.static(path.resolve(__dirname, "../build/")));

app.get(
    '/api/get_info/:flags',
    exceptionHandler(async (req, res) => {
        let flags = req.params.flags
        const response = await axios({
            method: 'get',
            url: api,
            data: {
                method: 'getinfo',
                params: { flags: parseInt(flags) }
            }
        })
        res.json(response.data)
    })
)

app.get(
    '/api/get_total_coins',
    exceptionHandler(async (req, res) => {
        const response = await axios({
            method: 'get',
            url: api,
            data: {
                method: 'getinfo',
                params: { flags: parseInt(4294967295) }
            }
        })

        let str = response.data.result.total_coins
        let result
        let totalCoins = Number(str)
        if (typeof totalCoins === 'number') {
            result = parseInt(totalCoins) / 1000000000000
        }
        let r2 = result.toFixed(2)
        res.send(r2)
    })
)

app.get(
    '/api/get_blocks_details/:start/:count',
    exceptionHandler(async (req, res) => {
        let start = req.params.start
        let count = req.params.count
        const response = await axios({
            method: 'get',
            url: api,
            data: {
                method: 'get_blocks_details',
                params: {
                    height_start: parseInt(start ? start : 0),
                    count: parseInt(count ? count : 10),
                    ignore_transactions: false
                }
            }
        })
        res.json(response.data)
    })
)

app.get(
    '/api/get_main_block_details/:id',
    exceptionHandler(async (req, res) => {
        let id = req.params.id
        const response = await axios({
            method: 'get',
            url: api,
            data: {
                method: 'get_main_block_details',
                params: {
                    id: id
                }
            }
        })
        res.json(response.data)
    })
)

const getWhitelistedAssets = async (offset, count, searchText) => {  
    const response = await axios({
        method: 'get',
        url: config.assets_whitelist_url || 'https://api.zano.org/assets_whitelist_testnet.json'
    });

    if (!response.data.assets) {
        throw new Error('Assets whitelist response not correct');
    }

    const allAssets = response.data.assets;
    allAssets.unshift({
        asset_id: "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a",
        logo: "",
        price_url: "",
        ticker: "ZANO",
        full_name: "Zano (Native)",
        total_max_supply: "0",
        current_supply: "0",
        decimal_point: 0,
        meta_info: "",
        price: 0
    });
    const searchTextLower = searchText?.toLowerCase();

    const filteredAssets =  allAssets
        .filter(asset => {
            return searchText 
                ? (
                    asset.ticker?.toLowerCase()?.includes(searchTextLower) || 
                    asset.full_name?.toLowerCase()?.includes(searchTextLower)
                ) 
                : true
        });

    if (filteredAssets.length > 0) {
        return filteredAssets.slice(offset, offset + count);
    } else {
        return allAssets.filter(e => e.asset_id === searchText).slice(offset, offset + count);
    }
        
}

app.get(
    '/api/get_whitelisted_assets/:offset/:count',
    exceptionHandler(async (req, res) => {
        const offset = parseInt(req.params.offset, 10);
        const count = parseInt(req.params.count, 10);
        const searchText = req.query.search || '';

        res.send(await getWhitelistedAssets(offset, count, searchText));

    })
)

app.get(
    '/api/get_assets/:offset/:count',
    exceptionHandler(async (req, res) => {
        const offset = parseInt(req.params.offset, 10);
        const count = parseInt(req.params.count, 10);
        const searchText = req.query.search || '';

        if (!searchText) {
            const rows = (
                await db.query(
                    "SELECT * FROM assets ORDER BY id ASC LIMIT $1 OFFSET $2", 
                    [
                        count, 
                        offset
                    ]
                )
            ).rows;

            return res.send(rows);
        }

        const firstSearchRowCount = (await db.query(
            `SELECT COUNT(*) FROM assets WHERE 
            LOWER(ticker) LIKE CONCAT('%', LOWER($1::text), '%') OR 
            LOWER(full_name) LIKE CONCAT('%', LOWER($1::text), '%')`, 
            [
                searchText
            ]
        )).rows[0].count;


        if (firstSearchRowCount > 0) {
            const rows = (
                await db.query(
                    `SELECT * FROM assets WHERE 
                    LOWER(ticker) LIKE CONCAT('%', LOWER($3::text), '%') OR 
                    LOWER(full_name) LIKE CONCAT('%', LOWER($3::text), '%')
                    ORDER BY id ASC 
                    LIMIT $1 OFFSET $2`, 
                    [
                        count, 
                        offset,
                        searchText
                    ]
                )
            ).rows;

            return res.send(rows); 
        } else {
            const rows = (
                await db.query(
                    "SELECT * FROM assets WHERE asset_id=$3 LIMIT $1 OFFSET $2", 
                    [
                        count, 
                        offset,
                        searchText
                    ]
                )
            ).rows;

            return res.send(rows); 
        }
    })
)

let priceData = {};

app.get('/api/price', exceptionHandler(async (req, res) => {

    if (req.query.asset_id) {

        if (req.query.asset_id === ZANO_ASSET_ID) {

            if (!priceData?.zano?.zano?.usd) {
                res.send({ success: false, data: "Price not found" });
            }

            return res.send({
                success: true,
                data: {
                    name: "Zano",
                    usd: priceData?.zano?.zano?.usd,
                    usd_24h_change: priceData?.zano?.zano?.usd_24h_change
                }
            })
        }

        const assetData = (await db.query("SELECT * FROM assets WHERE asset_id = $1", [req.query.asset_id]))?.rows?.[0];
     
        if (!assetData) {
            return res.json({ success: false, data: "Asset not found" });
        } 

        

    }

    const responseData = {
        success: true,
        data: priceData.zano
    };

    switch (req.query.asset) {
        case "ethereum":
            if (priceData?.ethereum?.ethereum?.usd === undefined) {
                responseData.data = {};
                responseData.success = false;
            } else {
                responseData.data = priceData.ethereum;
            }
            break;
        default:
            if (priceData?.zano?.zano?.usd === undefined) {
                responseData.data = {};
                responseData.success = false;
            }
            break;
    }

    return res.json(responseData);

}));

app.get('/api/get_asset_details/:asset_id', exceptionHandler(async (req, res) => {
    const { asset_id } = req.params;
    const dbAsset = (await db.query("SELECT * FROM assets WHERE asset_id = $1", [asset_id])).rows[0];
    if (!dbAsset) {


        const response = await axios({
            method: 'get',
            url: config.assets_whitelist_url || 'https://api.zano.org/assets_whitelist_testnet.json'
        });
        
        if (!response.data.assets) {
            throw new Error('Assets whitelist response not correct');
        }

        const allAssets = response.data.assets;
        allAssets.unshift({
            asset_id: "d6329b5b1f7c0805b5c345f4957554002a2f557845f64d7645dae0e051a6498a",
            logo: "",
            price_url: "",
            ticker: "ZANO",
            full_name: "Zano (Native)",
            total_max_supply: "0",
            current_supply: "0",
            decimal_point: 0,
            meta_info: "",
            price: 0
        });

        const whitelistedAsset = allAssets.find(e => e.asset_id === asset_id);

        if (whitelistedAsset) {
            return res.json({ success: true, asset: whitelistedAsset });
        } else {
            return res.json({ success: false, data: "Asset not found" });
        }
    } else {
        return res.json({ success: true, asset: dbAsset });
    }
}));

(async () => {
    while (true) {
        try {

            async function fetchAssets(offset, count) {
                try {
                    const response = await axios({
                        method: 'get',
                        url: api,
                        data: {
                            method: 'get_assets_list',
                            params: {
                                count: count,
                                offset: offset,
                            }
                        }
                    });
    
                    return response?.data?.result?.assets || [];
                } catch {
                    return [];
                }
            }

            const zanoInfo = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=zano&vs_currencies=usd&include_24hr_change=true").then(res => res.json());

            await new Promise(res => setTimeout(res, 5 * 1e3));

            try {
                const ethInfo = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true").then(res => res.json());
                console.log('ETH INFO: ', ethInfo);
                if (ethInfo?.ethereum?.usd !== undefined) {
                    priceData.ethereum = ethInfo;
                }
            } catch (error) {
                console.log('ETH PARSING ERROR');
                console.log('Error: ', error);
            }

            console.log('ZANO INFO: ', zanoInfo);

            if (zanoInfo?.zano?.usd !== undefined) {
                priceData.zano = zanoInfo;
            }

            const assets = [];

            let iterator = 0;
            const amountPerIteration = 100;

            while (true) {
                const newAssets = await fetchAssets(iterator + 1, iterator + amountPerIteration);
                if (!newAssets.length) break;
                assets.push(...newAssets);
                iterator += amountPerIteration;
            }

            
            console.log('Got assets list');

            const assetsRows = (await db.query("SELECT * FROM assets")).rows;
            for (const assetRow of assetsRows) {
                const foundAsset = assets.find(e => e.asset_id === assetRow.asset_id);
                if (!foundAsset) {
                    await db.query("DELETE FROM assets WHERE asset_id=$1", [assetRow.asset_id]);
                } else {
                    const {
                        asset_id,
                        logo,
                        price_url,
                        ticker,
                        full_name,
                        total_max_supply,
                        current_supply,
                        decimal_point,
                        meta_info,
                        price
                    } = foundAsset;

                    await db.query(
                        `UPDATE assets SET 
                            logo=$1, 
                            price_url=$2, 
                            ticker=$3, 
                            full_name=$4, 
                            total_max_supply=$5, 
                            current_supply=$6, 
                            decimal_point=$7, 
                            meta_info=$8,
                            price=$9 WHERE asset_id=$10
                        `,
                        [
                            logo || "",
                            price_url || "",
                            ticker || "",
                            full_name || "",
                            total_max_supply?.toString() || "0",
                            current_supply?.toString() || "0",
                            decimal_point || 0,
                            meta_info || "",
                            price,
                            asset_id
                        ]
                    )
                }
            }
            for (const asset of assets) {
                const foundAsset = assetsRows.find(e => e.asset_id === asset.asset_id);
                if (!foundAsset && asset.asset_id) {
                    const {
                        asset_id,
                        logo,
                        price_url,
                        ticker,
                        full_name,
                        total_max_supply,
                        current_supply,
                        decimal_point,
                        meta_info,
                        price = 0
                    } = asset;

                    await db.query(
                        `
                            INSERT INTO assets(
                                asset_id, 
                                logo, 
                                price_url, 
                                ticker, 
                                full_name, 
                                total_max_supply, 
                                current_supply, 
                                decimal_point, 
                                meta_info,
                                price
                            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        `,
                        [
                            asset_id,
                            logo || "",
                            price_url || "",
                            ticker,
                            full_name,
                            total_max_supply?.toString(),
                            current_supply?.toString(),
                            decimal_point,
                            meta_info || "",
                            price
                        ]
                    )
                }
            }
        } catch (error) {
            console.log('ASSETS PARSING ERROR');
            console.log('Error: ', error);
        }
        await new Promise(res => setTimeout(res, 60 * 1e3));
    }
})();
