const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseUnits } = require("ethers"); // Ensure compatibility

describe("Factory", function () {
  const FEE = parseUnits("0.01", 18);

  async function deployFactoryFixture() {
    // Fetch accounts
    const [deployer, creator, buyer] = await ethers.getSigners();

    // Fetch the contract
    const Factory = await ethers.getContractFactory("Factory");

    // Deploy the contract
    const factory = await Factory.deploy(FEE);

    // Create Contract
    const transaction = await factory
      .connect(creator)
      .create("Dapp Uni", "DAPP", { value: FEE });
    await transaction.wait();

    // Get token address
    const tokenAddress = await factory.tokens(0);
    const token = await ethers.getContractAt("Token", tokenAddress);

    return { factory, token, deployer, creator, buyer };
  }

  async function buyTokenFixture() {
    const { factory, token, creator, buyer } = await deployFactoryFixture();

    const AMOUNT = ethers.parseUnits("1000", 18);
    const COST = ethers.parseUnits("1", 18);

    // But tokens
    const transaction = await factory
      .connect(buyer)
      .buy(await token.getAddress(), AMOUNT, { value: COST });
    await transaction.wait();

    return { factory, token, creator, buyer };
  }

  describe("Deployment", function () {
    it("Should set a fee", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);
      expect(await factory.fee()).to.equal(FEE);
    });

    it("Should set the owner", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);
      expect(await factory.owner()).to.equal(deployer.address);
    });
  });

  describe("Creating", function () {
    it("Should check if the token got successfully created", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      expect(await token.owner()).to.equal(await factory.getAddress());
    });

    it("Should set the creator", async function () {
      const { token, creator } = await loadFixture(deployFactoryFixture);
      expect(await token.creator()).to.equal(creator.address);
    });

    it("Should set the supply", async function () {
      const { factory, token } = await loadFixture(deployFactoryFixture);
      const totalSupply = parseUnits("1000000", 18);

      expect(await token.balanceOf(await factory.getAddress())).to.equal(
        totalSupply
      );
    });

    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(deployFactoryFixture);

      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );
      expect(balance).to.equal(FEE);
    });

    it("Should create a sale", async function () {
      const { factory, token, creator } = await loadFixture(
        deployFactoryFixture
      );

      const count = await factory.totalTokens();
      expect(count).to.equal(1);

      const sale = await factory.getTokenSale(0);

      expect(sale.token).to.equal(await token.getAddress(0));

      expect(sale.token).to.equal(await token.getAddress());
      expect(sale.creator).to.equal(creator.address);
      expect(sale.sold).to.equal(0);
      expect(sale.raised).to.equal(0);
      expect(sale.isOpen).to.equal(true);
    });
  });

  describe("Buying", function () {
    const AMOUNT = ethers.parseUnits("1000", 18);
    const COST = ethers.parseUnits("1", 18);

    // Check contract received ETH
    it("Should update ETH balance", async function () {
      const { factory } = await loadFixture(buyTokenFixture);

      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );
      expect(balance).to.equal(FEE + COST);
    });

    // Check that buyer received tokens
    it("Should update token balances", async function () {
      const { token, buyer } = await loadFixture(buyTokenFixture);

      const balance = await token.balanceOf(buyer.address);

      expect(balance).to.equal(AMOUNT);
    });

    it("Should increase base cost", async function () {
      const { factory, token } = await loadFixture(buyTokenFixture);

      const sale = await factory.tokenToSale(await token.getAddress());
      const cost = await factory.getCost(sale.sold);

      expect(cost).to.be.equal(ethers.parseUnits("0.0002"));
    });
  });

  describe("Depositing", function () {
    const AMOUNT = ethers.parseUnits("10000", 18);
    const COST = ethers.parseUnits("2", 18);

    it("Sale should be closed and successfully deposits", async function () {
      const { factory, token, creator, buyer } = await loadFixture(
        buyTokenFixture
      );

      // Buy tokens again to reach target
      const buyTx = await factory
        .connect(buyer)
        .buy(await token.getAddress(), AMOUNT, { value: COST });
      await buyTx.wait();

      const sale = await factory.tokenSale(await token.getAddress());
      expect(sale.isOpen).to.equal(false);

      const depositTX = await factory
        .connect(creator)
        .deposit(await token.getAddress());
      await depositTX.wait();

      const balance = await token.balanceOf(creator.address);
      expect(balance).to.equal(ethers.parseUnits("980000", 18));
    });
  });

  describe("Withdrawing Fees", function () {
    it("Should update ETH balances", async function () {
      const { factory, deployer } = await loadFixture(deployFactoryFixture);

      const transaction = await factory.connect(deployer).withdraw(FEE);
      await transaction.wait();

      const balance = await ethers.provider.getBalance(
        await factory.getAddress()
      );

      expect(balance).too.equal(0);
    });
  });
});
