const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Factory", function () {
  async function deployFactoryFixture() {
    // Fetch the contract
    const Factory = await ethers.getContractFactory("Factory");
    // Deploy the contract
    const factory = await Factory.deploy();

    return { factory };
  }

  it("should have a name", async function () {
    const { factory } = await deployFactoryFixture();
    // Check name
    const name = await factory.name();
    // Check name is correct
    expect(name).to.equal("Factory");
  });

  it("should have another name", async function () {
    const { factory } = await deployFactoryFixture();
    // Check name
    const name = await factory.name2();
    // Check name is correct
    expect(name).to.equal("Factory2");
  });
});
