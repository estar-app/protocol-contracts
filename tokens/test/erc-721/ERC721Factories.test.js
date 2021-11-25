const UpgradeableBeacon = artifacts.require("UpgradeableBeacon.sol");
const BeaconProxy = artifacts.require("BeaconProxy.sol");
const ERC721RaribleUserMinimal = artifacts.require("ERC721RaribleUserMinimal.sol");
const ERC721RaribleUserFactoryC2 = artifacts.require("ERC721RaribleUserFactoryC2.sol");
const ERC721RaribleMinimal = artifacts.require("ERC721RaribleMinimal.sol");
const ERC721RaribleFactoryC2 = artifacts.require("ERC721RaribleFactoryC2.sol");

const truffleAssert = require('truffle-assertions');

const zeroWord = "0x0000000000000000000000000000000000000000000000000000000000000000";
const zeroAddress = "0x0000000000000000000000000000000000000000";

contract("Test factories", accounts => {

	const tokenOwner = accounts[1];

	it("erc721 user factory is correct", async () => {
    const impl = await ERC721RaribleUserMinimal.new();
		const beacon = await UpgradeableBeacon.new(impl.address);
		const factory = await ERC721RaribleUserFactoryC2.new(beacon.address);
    const salt = 3;

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "RARI", "https://ipfs.rarible.com", "https://ipfs.rarible.com", [], salt)

		const resultCreateToken = await factory.createToken("name", "RARI", "https://ipfs.rarible.com", "https://ipfs.rarible.com", [], salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721RaribleUserProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721RaribleUserMinimal.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

  it("erc721 rarible factory is correct", async () => {
    const impl = await ERC721RaribleMinimal.new();
		const beacon = await UpgradeableBeacon.new(impl.address);
		const factory = await ERC721RaribleFactoryC2.new(beacon.address, zeroAddress, zeroAddress);
    const salt = 3;

    let proxy;
    const addressBeforeDeploy = await factory.getAddress("name", "RARI", "https://ipfs.rarible.com", "https://ipfs.rarible.com", salt)

		const resultCreateToken = await factory.createToken("name", "RARI", "https://ipfs.rarible.com", "https://ipfs.rarible.com", salt, {from: tokenOwner});
      truffleAssert.eventEmitted(resultCreateToken, 'Create721RaribleProxy', (ev) => {
        proxy = ev.proxy;
        return true;
      });
		const token = await ERC721RaribleMinimal.at(proxy);
    const minter = tokenOwner;
    let transferTo = accounts[2];

    assert.equal(proxy, addressBeforeDeploy, "correct address got before deploy")

    const tokenId = minter + "b00000000000000000000001";
    const tokenURI = "//uri";
    console.log("Before call _mintAndTransfer");
    const tx = await token.mintAndTransfer([tokenId, tokenURI, creators([minter]), [], [zeroWord]], transferTo, {from: minter});

		console.log("mint through proxy", tx.receipt.gasUsed);
    assert.equal(await token.ownerOf(tokenId), transferTo);
    assert.equal(await token.name(), "name")

    const txTransfer = await token.safeTransferFrom(transferTo, minter, tokenId, { from: transferTo });
    console.log("transfer through proxy", txTransfer.receipt.gasUsed);
	})

  function creators(list) {
  	const value = 10000 / list.length
  	return list.map(account => ({ account, value }))
  }

});