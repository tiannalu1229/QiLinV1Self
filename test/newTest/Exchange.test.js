const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require("@openzeppelin/test-environment");
const { expect } = require("chai");

const TestAggregator = contract.fromArtifact('TestAggregator');

const assert = require('assert');
const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const { deployer } = require("./Exchange.deplay");
const {
  testEnv,
  openPosition,
  initTestDepsForExchange,
} = require("./Exchange.functions");
const { checkOpenPositionThenClose } = require("./Exchange.behavior");

describe("System Test", function () {
  // this.timeout(15000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.fluidity = deployed.deps.Fluidity;
    this.fundToken = deployed.deps.FundToken;
    this.exchangeRates = deployed.deps.ExchangeRates;
    this.systemSetting = deployed.deps.SystemSetting;
  });

  it("system event", async function () {
    let max = await this.systemSetting.maxInitialLiquidityFunding();
    assert.equal(max, 500000000000000000000000);
  });

});

describe("Fluidity Contract Basic Test", async function () {
  // this.timeout(15000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.depot = deployed.deps.Depot;
    this.fluidity = deployed.deps.Fluidity;
    this.fundToken = deployed.deps.FundToken;
    this.exchangeRates = deployed.deps.ExchangeRates;

    await this.usdt.mint_(
        owner, BigNumber.from('2000000000000000000000000'), { from: owner })
    await this.usdt.mint_(
        alice, BigNumber.from('1000000000000000000000000'), { from: owner })
  });

  it("initial Liquidity event", async function () {

    let openAmt = BigNumber.from("500000000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });
    let res = await this.fluidity.initialFunding(
      BigNumber.from("500000000000000000000000"),
      { from: alice }
    );
    await fluidity.closeInitialFunding( { from: owner });

    expectEvent(res, "InitialFunding", {
      subscriber: alice,
      value: new BN("500000000000000000000000"),
    });
  });
});

describe("Fluidity Contract Test", async function () {
  // this.timeout(15000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.depot = deployed.deps.Depot;
    this.fluidity = deployed.deps.Fluidity;
    this.fundToken = deployed.deps.FundToken;
    this.exchangeRates = deployed.deps.ExchangeRates;

    await this.usdt.mint_(
        owner, BigNumber.from('5000000000000000000000000'), { from: owner });
    // await this.usdt.mint_(
    //     alice, BigNumber.from('5000000000000000000000000'), { from: owner });
  });

  it("fund Liquidity event", async function () {

    let res1 = await this.exchange.openPosition(
        deployed.data.currencyKey, 1, 2,
        BigNumber.from('3000000000000000000000000'), { from: owner });

    let res = await this.fluidity.fundLiquidity(
      BigNumber.from("100000000000000000000000"),
      { from: owner }
    );

    let price = await this.fluidity.fundTokenPrice();

    expectEvent(res, "FundLiquidity", {
      subscriber: owner,
      value: new BN("100000000000000000000000"),
      price: new BN("1000000000000000000"),
    });
  });

  it("draw Liquidity event", async function () {

    let res = await this.fluidity.withdrawLiquidity(
      BigNumber.from("100000000000000000000000"),
      { from: owner }
    );

    let price = await this.fluidity.fundTokenPrice();

    expectEvent(res, "WithdrawLiquidity", {
      redempter: owner,
      value: new BN("100000000000000000000000"),
      price: new BN(price),
    });
  });
});

describe("Exchange Basic Test", function () {
  // this.timeout(15000);

  const [owner] = accounts;

  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
  });

  it("the deployer is the owner", async function () {
    expect(await this.exchange.owner()).to.equal(owner);
  });

  it("fundToken get", async function () {
    expect(await this.exchange.fundToken_()).equal(this.deps.FundToken.address);
  });
});

describe("Exchange Contract Basic Test", async function () {
  // this.timeout(15000);

  const [owner, alice] = accounts;

  beforeEach(async function () {
    await initTestDepsForExchange(this, owner, [alice]);
  });

  it("open Position event", async function () {
    let openAmt = BigNumber.from("1000000000000000000");
    await this.usdt.approve(this.depot.address, openAmt, { from: alice });

    await this.testAggregator.setState(BigNumber.from("100000000"), 0, 0, {
      from: owner,
    });

    let res = await this.exchange.openPosition(
      deployed.data.currencyKey,
      1,
      5,
      BigNumber.from("1000000000000000000"),
      { from: alice }
    );

    expectEvent(res, "OpenPosition", {
      sender: alice,
      positionId: new BN(1),
      price: new BN("100000000000000000000000000"),
      currencyKey: deployed.data.currencyKey,
      direction: new BN(1),
      level: new BN(5),
      position: new BN("1000000000000000000"),
    });
  });

  it("open Position then close by user", async function () {
    await checkOpenPositionThenClose(
      this,
      alice,
      2,
      10,
      "1000000000000000000",
      async function () { },
      {
        serviceFee: new BN("15000000000000000"),
        marginLoss: new BN(0),
        isProfit: false,
        value: new BN("0"),
      }
    );
  });
});

describe("Exchange Contract Profit Test", async function () {
  this.timeout(90000);

  const [owner, alice] = accounts;
  let posId = 0;
  let pos = 0;
  beforeEach(async function () {
    deployed = await deployer(owner);
    this.exchange = deployed.exchange;
    this.deps = deployed.deps;
    this.usdt = deployed.deps.USDT;
    this.depot = deployed.deps.Depot;
    this.liquidation = deployed.deps.Liquidation;
    this.fluidity = deployed.deps.Fluidity;
    this.systemSetting = deployed.deps.SystemSetting;
    this.testAggregator = deployed.aggregator;

    await this.usdt.mint_(
        owner, BigNumber.from('10000000000000000000000000'), { from: owner });

    let openAmt = BigNumber.from('10000000000000000000000000');
    await this.usdt.approve(this.depot.address, openAmt, { from: owner });

    await this.testAggregator.setState(
        BigNumber.from('1900'), 0, 0, { from: owner });

    posId = await this.exchange.openPosition(
        utils.formatBytes32String("ETH-USDC"), 2, 10,
        BigNumber.from('10000000000000000000000'), { from: owner });
    pos = await this.depot.position(1);
  });

  it("open position and close position with less price", async function () {
    await this.testAggregator.setState(BigNumber.from("1000"), 0, 0, {
      from: owner,
    });
    let size = new Number((new Number((pos[2].toString(10))) / new Number(pos[3].toString(10))).toString(10));
    let pnl = 900 * size;
    console.log(pnl);
    let closingFee = (await this.systemSetting.positionClosingFee()).toString(10);
    let serviceFee = 100000 * new Number(closingFee);
    console.log(serviceFee);
    let netValue = await this.depot.netValue(0);
    let share = await this.depot.position(1).share;
    let shareSubnetValue = netValue * share;
    let marginLoss = (100000 - shareSubnetValue) > 0 ? (100000 - shareSubnetValue) : 0;
    let res = await this.exchange.closePosition(1, { from: owner });

    expectEvent(res, 'ClosePosition', {
        sender: owner,
        positionId: new BN(1),
        price: new BN("1000000000000000000000"),
        serviceFee: new BN("150000000000000000000"),
        marginLoss: new BN(0),
        isProfit: true,
        value: new BN("47368421052631578947368"),
    });
  });

  it("open position and close position with more price", async function () {
    await this.testAggregator.setState(BigNumber.from("2000"), 0, 0, {
      from: owner,
    });
    let pool = (await this.depot.liquidityPool()).toString(10);
    console.log("账户地址:              " + pos[0].toString(10));
    console.log("份额:                  " + pos[1].toString(10));
    console.log("杠杆头寸:              " + pos[2].toString(10));
    console.log("开仓价:                " + pos[3].toString(10));
    console.log("币种id:                " + pos[4].toString(10));
    console.log("开仓方向:              " + pos[5].toString(10));
    console.log("保证金:                " + pos[6].toString(10));

    let res = await this.exchange.closePosition(1, { from: owner });

    let size = pos[2].toString(10) / pos[3].toString(10);
    let pnl = (pos[3].toString(10) - 2000000000000000000000) * size;
    let closingFee = (await this.systemSetting.positionClosingFee()).toString(10);
    let serviceFee = 100000000000000000000000 * new Number(closingFee) / 1e18;
    let newPool = pool - pnl;
    let lp = newPool / pool;
    console.log("持仓量:                " + size);
    console.log("盈利额:                " + pnl / 1e18);
    console.log("服务费:                " + serviceFee);
    console.log("底池金额:              " + newPool / 1e18);
    console.log("LP价格:                " + lp);

    expectEvent(res, 'ClosePosition', {
        sender: owner,
        positionId: new BN(1),
        price: new BN("2000000000000000000000"),
        serviceFee: new BN("150000000000000000000"),
        marginLoss: new BN(0),
        isProfit: false,
        value: new BN("5263157894736842105263"),
    });
  });
});
