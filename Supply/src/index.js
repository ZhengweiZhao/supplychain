import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/SupplyChain.json";

let accounts;
let company;
const Nav = {
    NewAccount: function() {
        document.getElementById('add').style.display = "block";
        document.getElementById('sign').style.display = "none";
        document.getElementById('transfer').style.display = "none";
        document.getElementById('financing').style.display = "none";
        document.getElementById('pay').style.display = "none";
    },

    purchase: function() {
        document.getElementById('add').style.display = "none";
        document.getElementById('sign').style.display = "block";
        document.getElementById('transfer').style.display = "none";
        document.getElementById('financing').style.display = "none";
        document.getElementById('pay').style.display = "none";
    },

    receiptTrans: function() {
        document.getElementById('add').style.display = "none";
        document.getElementById('sign').style.display = "none";
        document.getElementById('transfer').style.display = "block";
        document.getElementById('financing').style.display = "none";
        document.getElementById('pay').style.display = "none";
    },

    financing: function() {
        document.getElementById('add').style.display = "none";
        document.getElementById('sign').style.display = "none";
        document.getElementById('transfer').style.display = "none";
        document.getElementById('financing').style.display = "block";
        document.getElementById('pay').style.display = "none";
    },

    payment: function() {
        document.getElementById('add').style.display = "none";
        document.getElementById('sign').style.display = "none";
        document.getElementById('transfer').style.display = "none";
        document.getElementById('financing').style.display = "none";
        document.getElementById('pay').style.display = "block";
    }
}

const App = {
    web3: null,
    account: null,
    meta: null,

    start: async function() {
        const { web3 } = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = metaCoinArtifact.networks[networkId];
            this.meta = new web3.eth.Contract(
                metaCoinArtifact.abi,
                deployedNetwork.address,
            );

            // get accounts
            accounts = await web3.eth.getAccounts();
            this.account = accounts[0];
            company = accounts[0];

            const addressElement = document.getElementById("account-address");
            addressElement.innerHTML = this.account;

            document.getElementById('add').style.display = "none";
            document.getElementById('sign').style.display = "none";
            document.getElementById('transfer').style.display = "none";
            document.getElementById('financing').style.display = "none";
            document.getElementById('pay').style.display = "none";

        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    changeAccount: function() {

        const account_id = parseInt(document.getElementById('account-input').value)
        if (account_id < 10 && account_id >= 0) {
            const addressElement = document.getElementById("account-address");
            this.account = accounts[account_id];
            addressElement.innerHTML = this.account;
            this.refreshName();
            this.refreshBalance();
        } else {
            document.getElementById('account-address').innerHTML = "no such an account!";
            const balanceElement = document.getElementById("balance");
            balanceElement.innerHTML = "NAN";
        }
    },

    NewAccount: async function() {
        const name = document.getElementById("add-cname").value;
        const caddress = document.getElementById("add-caddress").value;
        const isbank = document.getElementById("add-isbank").value;
        const balance = document.getElementById("add-cbalance").value;
        this.setStatus("adding company", "status0");
        const { NewAccount } = this.meta.methods;
        await NewAccount(name, caddress, isbank, balance).send({ from: this.account, gas: 999999999 });
        this.setStatus("add company", "status0");
    },

    //功能一
    purchase: async function() {
        const caddress = document.getElementById("sign-caddress").value;
        const amount = parseInt(document.getElementById("sign-amount").value);
        const time = parseInt(document.getElementById("sign-time").value);
        this.setStatus("Initiating ...", "status1");

        const { purchase } = this.meta.methods;
        await purchase(caddress, amount, time).send({ from: this.account, gas: 6999999999 });
        this.setStatus("completed!", "status1");
        this.refreshBalance();
        this.refreshReceipt();
       
    },

    //功能二
    receiptTrans: async function() {
        const caddress = document.getElementById("transfer-caddress").value;
        const amount = parseInt(document.getElementById("transfer-amount").value);
        const rid = parseInt(document.getElementById("transfer-rid").value);
        this.setStatus('transfering... ', "status2");
        const { receiptTrans } = this.meta.methods;
        await receiptTrans(caddress, amount, rid).send({ from: this.account, gas: 9999999999 });
        this.refreshBalance();
        this.refreshReceipt();
        this.setStatus('completed!', "status2");
    },

    //功能三
    financing: async function() {
        const rid = parseInt(document.getElementById("financing-rid").value);
        this.setStatus('Financing...', "status3");
        const { financing } = this.meta.methods;
        await financing(rid).send({ from: this.account, gas: 999999999 });
        this.refreshBalance();
        this.refreshReceipt();
        this.setStatus('completed!', "status3");
    },

    //功能四
    payment: async function() {
        const rid = parseInt(document.getElementById("payment-rid").value);
        this.setStatus('paying... ', "status4");
        const { payment } = this.meta.methods;
        await payment(rid).send({ from: this.account, gas: 6721975 });
        this.refreshBalance();
        this.refreshReceipt();
        this.setStatus('completed!', "status4");
    },

    refreshBalance: async function() {
        const { getBalance } = this.meta.methods;
        const balance = await getBalance(this.account).call();
        const balanceElement = document.getElementById("balance");
        balanceElement.innerHTML = balance;
    },

    refreshName: async function() {
        const { getName } = this.meta.methods;
        const name = await getName(this.account).call();
        const nameElement = document.getElementById("name");
        nameElement.innerHTML = name;
    },

    refreshReceipt: async function() {

    },

    setStatus: function(message, statusStr) {
        const status = document.getElementById(statusStr);
        status.innerHTML = message;
    },

};

window.App = App;
window.Nav = Nav;
window.addEventListener("load", function() {
        App.web3 = new Web3(
            new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
        );
        this.console.log("web3");
    App.start();
});