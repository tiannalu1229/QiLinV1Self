const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');
const assert = require('assert');
const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const Exchange = contract.fromArtifact('ExchangeMock');
const Fluidity = contract.fromArtifact('Fluidity');
const Liquidation = contract.fromArtifact('LiquidationMock');
const Depot = contract.fromArtifact('DepotMock');
const ExchangeRates = contract.fromArtifact('ExchangeRates');
const FundToken = contract.fromArtifact('FundTokenMock');
const USDT = contract.fromArtifact('USDTMock');
const SystemSetting = contract.fromArtifact('SystemSetting');
const TestAggregator = contract.fromArtifact('TestAggregator');

describe("Ban Open Position", async function () {
  const [owner, alice] = accounts;
  beforeEach(async function () {
    exchange = await Exchange.new({ from: owner });
    fluidity = await Fluidity.new({ from: owner });
    liquidation = await Liquidation.new({ from: owner });
    exchangeRates = await ExchangeRates.new({ from: owner });
    usdt = await USDT.new({ from: owner });
    systemSetting = await SystemSetting.new({ from: owner });
    testAggregator = await TestAggregator.new({ from: owner });

    powerAdds = [exchange.address, fluidity.address, liquidation.address];
    depot = await Depot.new(
        powerAdds,
        { from: owner }
    )

    fundToken = await FundToken.new(fluidity.address, { from: owner })

    await exchangeRates.addCurrencyKey(
        utils.formatBytes32String("ETH-USDC"), testAggregator.address,
        { from: owner })

    await testAggregator.setState(1000, 0, 0, { from: owner });
    // set exchange
    await exchange.importAddresses(
        [
            utils.formatBytes32String("FundToken"),
            utils.formatBytes32String("SystemSetting"),
            utils.formatBytes32String("ExchangeRates"),
            utils.formatBytes32String("Depot"),
            utils.formatBytes32String("BaseCurrency")
        ],
        [
            fundToken.address,
            systemSetting.address,
            exchangeRates.address,
            depot.address,
            usdt.address
        ], { from: owner }
    )

    await fluidity.importAddresses(
        [
            utils.formatBytes32String('FundToken'),
            utils.formatBytes32String("SystemSetting"),
            utils.formatBytes32String("Depot"),
            utils.formatBytes32String("BaseCurrency")
        ],
        [
            fundToken.address,
            systemSetting.address,
            depot.address,
            usdt.address
        ], { from: owner }
    )

    await liquidation.importAddresses(
        [
            utils.formatBytes32String('FundToken'),
            utils.formatBytes32String("ExchangeRates"),
            utils.formatBytes32String("SystemSetting"),
            utils.formatBytes32String("Depot"),
            utils.formatBytes32String("BaseCurrency")
        ],
        [
            fundToken.address,
            exchangeRates.address,
            systemSetting.address,
            depot.address,
            usdt.address
        ], { from: owner }
    )

    await depot.importAddresses(
        [
            utils.formatBytes32String("ExchangeRates"),
            utils.formatBytes32String("BaseCurrency")
        ],
        [
            exchangeRates.address,
            usdt.address
        ], { from: owner }
    )

    await systemSetting.setMaxInitialLiquidityFunding(BigNumber.from("500000000000000000000000"), { from: owner }); // 500,000U
    await systemSetting.setConstantMarginRatio(BigNumber.from("200000000000000000"), { from: owner }); // 20%
    await systemSetting.setMinInitialMargin(BigNumber.from("1000000000000000000"), { from: owner }); // 1U
    await systemSetting.setMarginRatio(BigNumber.from("200000000000000000"), { from: owner }); // 20%
    await systemSetting.setImbalanceThreshold(BigNumber.from("100000000000000000"), { from: owner }); //  10%
    await systemSetting.setPositionClosingFee(BigNumber.from("1500000000000000"), { from: owner }); // 0.15%
    await systemSetting.setLiquidationFee(BigNumber.from("20000000000000000"), { from: owner }); // 2%

    await systemSetting.addLeverage(2, { from: owner });
    await systemSetting.addLeverage(5, { from: owner });
    await systemSetting.addLeverage(10, { from: owner });
    await systemSetting.addLeverage(15, { from: owner });
    await systemSetting.addLeverage(20, { from: owner });

    await systemSetting.setMinAddDeposit(BigNumber.from("1000000000000000000"), { from: owner }); // 1U
    await systemSetting.setMinHoldingPeriod(1, { from: owner }); // 1s
    await systemSetting.setRebaseInterval(1, { from: owner }); // 1s
    await systemSetting.setRebaseRate(200, { from: owner }); // 20

    await systemSetting.resumeSystem({ from: owner })

    await usdt.mint_(owner, BigNumber.from("5000000000000000000000000"), { from: owner })
    await usdt.approve(depot.address, BigNumber.from("5000000000000000000000000"), { from: owner })
  })

  it("Ban Open Position", async function () {
  console.log((await depot.initialFundingCompleted()).toString(10));
    const [owner, alice] = accounts;

    let posId = await exchange.openPosition(
        utils.formatBytes32String("ETH-USDC"), 2, 10,
        BigNumber.from('10000000000000000000000'), { from: owner });
  });

  it("Pool Not Enough Close Position", async function () {
    const [owner, alice] = accounts;

    await fluidity.initialFunding(BigNumber.from("500000000000000000000000"), { from: owner })
    await fluidity.closeInitialFunding( { from: owner })
    await testAggregator.setState(
        BigNumber.from('1000'), 0, 0, { from: owner });

    let posId = await exchange.openPosition(
        utils.formatBytes32String("ETH-USDC"), 1, 10,
        BigNumber.from('200000000000000000000000'), { from: owner });

    await testAggregator.setState(
        BigNumber.from('2000'), 0, 0, { from: owner });
    let res3 = await exchange.closePosition(1, { from: owner });
    assert.equal((await depot.liquidityPool()).toString(10), 0);
  });

  it("Margin Not Enough Open Position", async function () {
    const [owner, alice] = accounts;

    await fluidity.initialFunding(BigNumber.from("500000000000000000000000"), { from: owner })
    await fluidity.closeInitialFunding( { from: owner })
    await testAggregator.setState(
        BigNumber.from('1000'), 0, 0, { from: owner });

    let posId = await exchange.openPosition(
        utils.formatBytes32String("ETH-USDC"), 1, 10,
        BigNumber.from('100000000000000000000'), { from: owner });
  });
});
