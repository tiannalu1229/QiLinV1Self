const {
    BN,
    constants,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;
const { accounts, contract } = require('@openzeppelin/test-environment');
const { expect } = require('chai');

const ethers = require('ethers');
const utils = ethers.utils;
const BigNumber = ethers.BigNumber;

const { deployer } = require('../Exchange.deplay');

describe('Exchange Benchmark Test', function () {
    this.timeout(10000000);

    const [owner, alice] = accounts;

    beforeEach(async function () {
        deployed = await deployer(owner);
        this.exchange = deployed.exchange;
        this.deps = deployed.deps;
        this.usdt = deployed.deps.USDT;
        this.depot = deployed.deps.Depot;
        this.liquidation = deployed.deps.Liquidation;
        this.testAggregator = deployed.aggregator;
        this.systemSetting = deployed.deps.SystemSetting;

        await this.usdt.mint_(
            owner, BigNumber.from('1000000000000000000000'), { from: owner });
        // await this.usdt.mint_(
        //     alice, BigNumber.from('1000000000000000000000'), { from: alice })
    });

    it('openPosition 1', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1910'), 0, 0, { from: owner });
        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('2000'), 0, 0, { from: owner });
        let res3 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res3, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('600000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('21052631578947368421'),
        });
    });


    it('openPosition 2', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 10,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(10),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1500'), 0, 0, { from: owner });

        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1140'), 0, 0, { from: owner });
        let res3 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res3, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('3000000000000000000'),
            marginLoss: new BN(0),
            isProfit: true,
            value: new BN('800000000000000000000'),
        });
    });

    it('openPosition 3', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('2100'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('2100000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1910'), 0, 0, { from: owner });
        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('2000'), 0, 0, { from: owner });
        let res3 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res3, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('600000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('19047619047619047619'),
        });
    });

    it('openPosition 4', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1000'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 10,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1000000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(10),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1500'), 0, 0, { from: owner });

        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1140'), 0, 0, { from: owner });
        let res3 = await this.exchange.closePosition(1, { from: owner });

        expectEvent(res3, 'ClosePosition', {
            sender: owner,
            positionId: new BN(1),
            serviceFee: new BN('3000000000000000000'),
            marginLoss: new BN(0),
            isProfit: false,
            value: new BN('280000000000000000000'),
        });
    });

    it('openPosition 5', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1910'), 0, 0, { from: owner });
        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('380'), 0, 0, { from: owner });

        let res3 = await this.liquidation.liquidate(1, { from: owner });

        expectEvent(res3, 'Liquidate', {
          sender: owner,
          positionId: new BN(1),
          price: new BN('380000000000000000000'),
          serviceFee: new BN('600000000000000000'),
          liqReward: new BN('79400000000000000000'),
          marginLoss: new BN(0),
          isProfit: false,
          value: new BN('320000000000000000000'),
        });
    });

    it('openPosition 6', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 10,
            BigNumber.from('200000000000000000000'), { from: owner });

        let pos1 = await this.depot.position(1);

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(10),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1500'), 0, 0, { from: owner });

        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('2204'), 0, 0, { from: owner });

        let pos2 = await this.depot.position(1);
        let pos = await this.depot.position(1);
        console.log("账户地址:              " + pos1[0].toString(10) + "     " + pos2[0].toString(10));
        console.log("份额:                  " + pos1[1].toString(10) + "     " + pos2[1].toString(10));
        console.log("杠杆头寸:              " + pos1[2].toString(10) + "     " + pos2[2].toString(10));
        console.log("开仓价:                " + pos1[3].toString(10) + "     " + pos2[3].toString(10));
        console.log("币种id:                " + pos1[4].toString(10) + "     " + pos2[4].toString(10));
        console.log("开仓方向:              " + pos1[5].toString(10) + "     " + pos2[5].toString(10));
        console.log("保证金:                " + pos1[6].toString(10) + "     " + pos2[6].toString(10));

        let serviceFee = pos[2].toString(10) * (await this.systemSetting.positionClosingFee()).toString() / 1e18;
        let marginLoss = (await this.depot.calMarginLoss(pos[2].toString(10), pos[1].toString(10), 2)).toString();
        let feeAddML = serviceFee + marginLoss;
        console.log("serviceFee: " + serviceFee);
        console.log("marginLoss: " + marginLoss);
        console.log("feeAddML:   " + feeAddML);
        let value = pos[2].toString(10) * 8 / 100;
        let a = (pos[6].toString(10) - value) - feeAddML;
        let limit = pos[6].toString(10) * (await this.systemSetting.marginRatio()).toString() / 1e18;
        console.log("value:      " + value);
        console.log("杠杆头寸:   " + pos[2].toString(10));
        console.log("保证金:     " + pos[6].toString(10));
        console.log("a:          " + a);
        console.log("limit:      " + limit);
        console.log("result:     " + (a < limit));
        let res3 = await this.liquidation.liquidate(1, { from: owner });

        expectEvent(res3, 'Liquidate', {
          sender: owner,
          positionId: new BN(1),
          price: new BN('2204000000000000000000'),
          serviceFee: new BN('3000000000000000000'),
          liqReward: new BN('77000000000000000000'),
          marginLoss: new BN(0),
          isProfit: false,
          value: new BN('320000000000000000000'),
        });
    });

    it('openPosition 7', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 1, 2,
            BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(1),
            level: new BN(2),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1910'), 0, 0, { from: owner });
        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('2'), 0, 0, { from: owner });

        let res3 = await this.liquidation.bankruptedLiquidate(1, { from: owner });

        expectEvent(res3, 'BankruptedLiquidate', {
          sender: owner,
          positionId: new BN(1),
          price: new BN('2000000000000000000'),
          serviceFee: new BN('600000000000000000'),
          liqReward: new BN('8000000000000000000'),
          marginLoss: new BN(0),
          isProfit: false,
          value: new BN('399578947368421052631'),
        });
    });

    it('openPosition 8', async function () {
        let openAmt = BigNumber.from('7000000000000000000000');
        await this.usdt.approve(this.depot.address, openAmt, { from: owner });

        await this.testAggregator.setState(
            BigNumber.from('1900'), 0, 0, { from: owner });

        let res1 = await this.exchange.openPosition(
            deployed.data.currencyKey, 2, 10,
            BigNumber.from('200000000000000000000'), { from: owner });

        let pos1 = await this.depot.position(1);

        expectEvent(res1, 'OpenPosition', {
            sender: owner,
            positionId: new BN(1),
            price: new BN('1900000000000000000000'),
            currencyKey: deployed.data.currencyKey,
            direction: new BN(2),
            level: new BN(10),
            position: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('1500'), 0, 0, { from: owner });

        let res2 = await this.exchange.addDeposit(1, BigNumber.from('200000000000000000000'), { from: owner });

        expectEvent(res2, 'MarginCall', {
            sender: owner,
            positionId: new BN(1),
            margin: new BN('200000000000000000000'),
        });

        await this.testAggregator.setState(
            BigNumber.from('2278'), 0, 0, { from: owner });

        let res3 = await this.liquidation.bankruptedLiquidate(1, { from: owner });

        expectEvent(res3, 'BankruptedLiquidate', {
          sender: owner,
          positionId: new BN(1),
          price: new BN('2278000000000000000000'),
          serviceFee: new BN('3000000000000000000'),
          liqReward: new BN('8000000000000000000'),
          marginLoss: new BN(0),
          isProfit: false,
          value: new BN('397894736842105263157'),
        });
    });
});
