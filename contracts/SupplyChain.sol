pragma solidity >=0.4.21 <0.6.0;

contract SupplyChain {
    
    address private BANK;
    //地址类型address是一个值类型，
    //地址： 20字节（一个以太坊地址的长度）
    //地址类型也有成员
    //地址是所有合约的基础
    
    struct company {
        string name;
        address caddress; 
        bool isbank;
        uint balance;
    }
    
    struct receipt{
        bool isvalid;
        string fromName;
        string toName;
        address fromAddress;
        address toAddress;
        uint amount;
        uint deadline;
    }
    
    //映射类型，一种键值对的映射关系存储结构。定义方式为mapping(_KeyType => _KeyValue)。
    mapping(address => company) public companys;
    company[] companyList;
    
    mapping(address => receipt[]) public receipts;
    mapping(address => string) public names; 
    //对于金融应用程序，将用户的余额保存在一个 uint类型的变量中：
    mapping(address => uint)public balances; 
    
    //get函数
    function getName (address caddress) public view returns (string memory) {
        return companys[caddress].name;
    }
    
    function getBalance (address caddress) public view returns (uint) {
        return companys[caddress].balance;
    }
    
    constructor () public {
        BANK = msg.sender;
        //指定银行账户
        companys[msg.sender].name =  "China Bank";
        companys[msg.sender].isbank = true;
        companys[msg.sender].balance = 1000000000;
    }
    
    function NewAccount (string memory name, address caddress, bool isbank, uint balance) public {
        company storage newCompany = companys[caddress];
        newCompany.name = name;
        newCompany.caddress = caddress;
        newCompany.isbank = isbank;
        newCompany.balance = balance;
        companyList.push(newCompany);
    }

//实现采购商品—签发应收账款 交易上链
    function purchase(address caddress, uint amount, uint time) public {
        address f = msg.sender;
        address t = caddress;
        receipts[t].push(receipt({
            fromName: companys[f].name,
            toName: companys[t].name,
            fromAddress: companys[f].caddress,
            toAddress: companys[t].caddress,
            amount: amount,
            deadline: now + time,
            isvalid: true
        }));
    }
    
    //实现应收账款的转让上链
    function receiptTrans (address caddress, uint amount, uint r) public {
        address f = msg.sender;
        address t = caddress;
        if(receipts[msg.sender][r].isvalid==false)
            revert("The receipt is invalid!");
        if(receipts[msg.sender][r].amount<amount)
            revert("Transaction amount is too large!");
        receipts[f][r].amount -= amount;
        receipts[t].push(receipt({
            fromName: receipts[f][r].fromName,
            toName: companys[t].name,
            fromAddress: receipts[f][r].fromAddress,
            toAddress: companys[t].caddress,
            amount: amount,
            deadline: receipts[f][r].deadline,
            isvalid: true
        }));
    }
    //利用应收账款向银行融资上链
    function financing (uint r) public {
        if(receipts[msg.sender][r].isvalid==false)
            revert("The receipt is invalid!");
        receipts[msg.sender][r].isvalid = false;
        companys[BANK].balance -= receipts[msg.sender][r].amount;
        companys[msg.sender].balance += receipts[msg.sender][r].amount;
        receipts[BANK].push(receipt({
            fromName: receipts[msg.sender][r].fromName,
            toName: companys[BANK].name,
            fromAddress: receipts[msg.sender][r].fromAddress,
            toAddress: companys[BANK].caddress,
            amount: receipts[msg.sender][r].amount,
            deadline: receipts[msg.sender][r].deadline,
            isvalid: true
        }));
    }
    
    //应收账款支付结算上链
    function payment(uint r) public {
        require(receipts[msg.sender][r].deadline<now);
        if (receipts[msg.sender][r].isvalid == true && receipts[msg.sender][r].toAddress == msg.sender) {
            //借条以后无效了 
            receipts[msg.sender][r].isvalid = false;
            //pay
            companys[receipts[msg.sender][r].fromAddress].balance -= receipts[msg.sender][r].amount;
            companys[msg.sender].balance += receipts[msg.sender][r].amount;
        }
            
    }



}