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

// Currently set up to cancel all of the OWNER_ADDRESS's sell orders on FACTORY_CONTRACT_ADDRESS
async function main() {
      let { orders, count } = await seaport.api.getOrders({
        maker: OWNER_ADDRESS,
        side: 1,
        asset_contract_address: FACTORY_CONTRACT_ADDRESS 
      }, 1)
      const loops = Math.ceil(count / 20)

      console.log(`cancelling ${count} orders`)
      
      for (let j = 0; j < loops ; j++) {
        let { orders, count } = await seaport.api.getOrders({
          maker: OWNER_ADDRESS,
          side: 1,
          asset_contract_address: '0xb9cb8de016389827d6f848ccd4bdb9812d58e673'
        }, 1)

        for (let i = 0; i < orders.length  ;i++) {
          const cancelledOrder = await seaport.cancelOrder({ order: orders[i], accountAddress: OWNER_ADDRESS })
          console.log(`Successfully cancelled! ${orders[i].asset.name}\n`)
        }
      }
}

main()
