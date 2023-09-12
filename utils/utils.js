const Web3 = require("web3");
const config = require('../config.json');
const secret = require('../secret.json');
const ethers= require("ethers");

let web3 = new Web3(new Web3.providers.HttpProvider(config.web3_provider.sepolia.https));
web3.eth.handleRevert = true;

const abiCPLToken = require('../contracts/CPLToken.json').abi;
const abiCapacityPool = require('../contracts/CapacityPool.json').abi;
const abiCapacityRegistry = require('../contracts/CapacityRegistry.json').abi;

let contractCPLToken = new web3.eth.Contract(abiCPLToken, config.addressContractCPLToken);
let contractCapacityPool = new web3.eth.Contract(abiCapacityPool, config.addressContractCapacityPool);
let contractCapacityRegistry = new web3.eth.Contract(abiCapacityRegistry, config.addressContractCapacityRegistry);

module.exports={
    web3: web3,
    contractCPLToken: contractCPLToken,
    contractCapacityPool: contractCapacityPool,
    contractCapacityRegistry: contractCapacityRegistry,
}




