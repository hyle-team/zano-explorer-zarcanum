// run only from package.json (npm run wallet)

const spawn = require('child_process').spawn;
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// simplewallet --wallet-file D:/zanoTestMain/zanowallet --password root --rpc-bind-ip 127.0.0.1 --rpc-bind-port 12233 --daemon-address 127.0.0.1:12111

const simplewalletCMD = 
`
    ${__dirname}/simplewallet 
    --wallet-file ${__dirname}/quick_run_wallet 
    --password 12345 
    --rpc-bind-ip 127.0.0.1 
    --rpc-bind-port ${config.auditable_wallet.api.split(':')[2] || config.auditable_wallet.api.split(':')[1]} 
    --daemon-address ${config.api.split('://')[1]}
`.replace(/\n/g, '');

(async () => {

    spawn(`${__dirname}/zanod.exe`, [], { shell: true,  detached: true, stdio: 'ignore' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    spawn(simplewalletCMD, [], { shell: true, detached: true, stdio: 'pipe' });
    console.log('DONE - closing main process!');
    process.exit(0);

})();