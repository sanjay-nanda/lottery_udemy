const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy( { data: bytecode })
        .send({ from: accounts[0], gas: '1000000'});   
})

describe('Lottery Contract tests', () => {
    
    it("deploys the contract", () => {
        assert.ok(lottery.options.address); //checks if the contract is deployed
    });

    it("one account entering the lottery", async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.strictEqual(accounts[0], players[0]);
        assert.strictEqual(1, players.length)
    });

    it("requires min value to enter", async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '0'
            });
        }
        catch (err){
            assert(true);
            return;
        }
        assert(false);
    });

    it("only manager can pick the winner", async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
        }
        catch(err){
            assert(true);
            return;
        }
        assert(false);
    })
})