const opensea = require('opensea-js')
const OpenSeaPort = opensea.OpenSeaPort;
const Network = opensea.Network;

const MnemonicWalletSubprovider = require('@0x/subproviders').MnemonicWalletSubprovider
const RPCSubprovider = require('web3-provider-engine/subproviders/rpc')
const Web3ProviderEngine = require('web3-provider-engine')
const MNEMONIC = process.env.MNEMONIC
const INFURA_KEY = process.env.INFURA_KEY
const FACTORY_CONTRACT_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS
const OWNER_ADDRESS = process.env.OWNER_ADDRESS
const NETWORK = process.env.NETWORK
const API_KEY = process.env.API_KEY
const DAI_ADDRESS = process.env.DAI_ADDRESS
const NUM_OPTIONS = 26
const SOLD_SO_FAR = 5
const NUM_TO_SELL = 10

// const DATA = [
//     {
//         'price': 85,
//         'quantity': 50 
//     },
//     {
//         'price': 45,
//         'quantity': 100
//     },
//     {
//         'price': 1,
//         'token': "ETH",
//         'quantity': 15
//     },
//     {
//         'price': 85,
//         'quantity': 150
//     }
// ]

if (!MNEMONIC || !INFURA_KEY || !NETWORK || !OWNER_ADDRESS || !FACTORY_CONTRACT_ADDRESS || !API_KEY) {
    console.error("Please set a mnemonic, infura key, owner, network, API key, and factory contract address.")
    return
}
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const mnemonicWalletSubprovider = new MnemonicWalletSubprovider({ mnemonic: MNEMONIC, baseDerivationPath: BASE_DERIVATION_PATH})
const infuraRpcSubprovider = new RPCSubprovider({
    rpcUrl: 'https://' + NETWORK + '.infura.io/' + INFURA_KEY,
})

const providerEngine = new Web3ProviderEngine()
providerEngine.addProvider(mnemonicWalletSubprovider)
providerEngine.addProvider(infuraRpcSubprovider)
providerEngine.start();

const network = NETWORK === 'mainnet' ? Network.Main : Network.Rinkeby 
const seaport = new OpenSeaPort(providerEngine, {
  networkName: network,
  apiKey: API_KEY
}, (arg) => console.log(arg))

async function main() {

    // Example: many fixed price auctions.
    for (var i = 0; i < NUM_OPTIONS; i++) {
        const response = await fetch("https://opensea-items-api.herokuapp.com/api/factory/" + i)
        const data = await response.json()
        const price = data['cost']

        if (i === 6) {
            continue;
        }

        if (i <= 7) {
            continue;
        }

        const totalToSell = Math.min(data['quantity'], NUM_TO_SELL)
        let quantity = totalToSell - SOLD_SO_FAR

        if (quantity <= 0) {
            console.log("Finished selling option " + data)
            continue
        }

        console.log("Would sell " + data['quantity'] + " " + data['name'] + " for " + price)
        console.log(FACTORY_CONTRACT_ADDRESS)
        const sellData = {
            assetId: i,
            factoryAddress: FACTORY_CONTRACT_ADDRESS,
            accountAddress: OWNER_ADDRESS,
            startAmount: price,
            numberOfOrders: quantity,
        }

        
        const fixedSellOrders = await seaport.createFactorySellOrders(sellData)
        console.log(`Successfully made ${fixedSellOrders.length} fixed-price sell orders! ${fixedSellOrders[0].asset.openseaLink}\n`)
    }
}

main()