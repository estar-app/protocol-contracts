const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { getSettings } = require("./config.js")

const ExchangeMetaV2 = artifacts.require('ExchangeMetaV2');
const RoyaltiesRegistry = artifacts.require("RoyaltiesRegistry");
const ERC20TransferProxy = artifacts.require('ERC20TransferProxy');
const TransferProxy = artifacts.require('TransferProxy');

const ERC721RaribleMinimalBeacon = artifacts.require('ERC721RaribleMinimalBeacon');
const ERC721LazyMintTransferProxy = artifacts.require('ERC721LazyMintTransferProxy');
const ERC721RaribleMeta = artifacts.require('ERC721RaribleMeta');

const ERC1155RaribleBeacon = artifacts.require('ERC1155RaribleBeacon');
const ERC1155LazyMintTransferProxy = artifacts.require('ERC1155LazyMintTransferProxy');
const ERC1155RaribleMeta = artifacts.require('ERC1155RaribleMeta');

module.exports = async function (deployer, network) {
  const { communityWallet } = getSettings(network);

  const transferProxy = (await TransferProxy.deployed()).address;
  const erc20TransferProxy = (await ERC20TransferProxy.deployed()).address;
  const royaltiesRegistry = (await RoyaltiesRegistry.deployed()).address;
  const erc1155LazyMintTransferProxy = (await ERC1155LazyMintTransferProxy.deployed()).address;
  const erc721LazyMintTransferProxy = (await ERC721LazyMintTransferProxy.deployed()).address;

  //deploy exchangeV2 meta
  const exchangeV2 = await deployProxy(
    ExchangeMetaV2,
    [transferProxy, erc20TransferProxy, 0, communityWallet, royaltiesRegistry],
    { deployer, initializer: '__ExchangeV2_init' }
  );
  console.log("deployed meta exchangeV2 at", exchangeV2.address)

  //deploy ERC721 meta
  const erc721Proxy = await deployProxy(ERC721RaribleMeta, ["Rarible", "RARI", "ipfs:/", "", transferProxy, erc721LazyMintTransferProxy], { deployer, initializer: '__ERC721Rarible_init' });
  console.log("deployed erc721 meta at", erc721Proxy.address)
  const beacon721Minimal = await ERC721RaribleMinimalBeacon.deployed()
  console.log(`old impl 721 = ${await beacon721Minimal.implementation()}`)
  await beacon721Minimal.upgradeTo(erc721Proxy.address)
  console.log(`new impl 721 = ${await beacon721Minimal.implementation()}`)

  //deploy ERC1155 meta
  const erc1155Proxy = await deployProxy(ERC1155RaribleMeta, ["Rarible", "RARI", "ipfs:/", "", transferProxy, erc1155LazyMintTransferProxy], { deployer, initializer: '__ERC1155Rarible_init' });
  console.log("deployed erc1155 at", erc1155Proxy.address)
  const beacon1155 = await ERC1155RaribleBeacon.deployed();
  console.log(`old impl 1155 = ${await beacon1155.implementation()}`)
  await beacon1155.upgradeTo(erc1155Proxy.address)
  console.log(`new impl 1155 = ${await beacon1155.implementation()}`)

};