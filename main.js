console.log('Hello World');

const serverUrl = "https://xfwseoyfgpul.usemoralis.com:2053/server";
const appId = "BAwvbMiToQr1JICUrf4Tm2b4y6IJInP2DpWLGXMa";
Moralis.start({ serverUrl, appId });


login = async () => {
    await Moralis.authenticate().then(async function (user) {
        console.log('signed in')
        user.set("name", document.getElementById('user-username').value);
        user.set("email", document.getElementById('user-email').value);
        await user.save();
        const currentUser = Moralis.User.current();
        if (currentUser == null) {
            endSession
        } else {
            window.location.href = "dashboard.html";
        }
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "index.html";
}

getTransactions = async () => {
    console.log('Get transactions clicked')
    const transactions = await Moralis.Web3API.account.getTransactions();
    console.log(transactions)

    if(transactions.total > 0) {
        let table = `
        <table class="table">
        <thread>
             <tr>
                 <th scope="col">Transaction</th>
                 <th scope="col">Block Number</th>
                 <th scope="col">Age</th>
                 <th scope="col">Type</th>
                 <th scope="col">Fee</th>
                 <th scope="col">Value</th>
             </tr>
        </thead>
        <tbody id="theTransactions">
        </tbody>
        </table>
        `

        document.querySelector('#tableOfTransactions').innerHTML = table;

        transactions.result.forEach(t => {
            let content = `
            <tr>
                <td><a href='https://etherscan.io/tx/${t.hash}' target="_blank" rel="noopener noreferrer">${t.hash}</a></td>
                <td><a href='https://etherscan.io/block/${t.block_number}' target="_blank" rel="noopener noreferrer">${t.block_number}</a></td>
                <td>${millisecondsToTime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</td>
                <td>${t.from_address == Moralis.User.current().get('ethAddress') ? 'Outgoing' : 'Incoming'}</td>
                <td>${((t.gas * t.gas_price) / 1e18).toFixed(5)} ETH</td>
                <td>${(t.value / 1e18).toFixed(5)} ETH</td>
            <tr>
            `
            theTransactions.innerHTML += content;
        })
    }
}

getBalances = async () => {
    console.log('Get balances clicked');
    const ethBalance = await Moralis.Web3API.account.getNativeBalance();
    const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "ropsten" });
    const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({ chain: "rinkeby" });
    console.log((ethBalance.balance / 1e18).toFixed(5) + " ETH");
    console.log((ropstenBalance.balance / 1e18).toFixed(5) + " ETH");
    console.log((rinkebyBalance.balance / 1e18).toFixed(5) + " ETH");

    let content = document.querySelector('#userBalances').innerHTML = `
    <table class="table">
    <thread>
         <tr>
             <th scope="col">Token</th>
             <th scope="col">Balance</th>
         </tr>
    </thead>
    <tbody>
        <tr>
            <th>Ether</th>
            <td>${(ethBalance.balance / 1e18).toFixed(5) + " ETH"}</td>
        </tr>
        <tr>
            <th>Ropsten</th>
            <td>${(ropstenBalance.balance / 1e18).toFixed(5) + " ETH"}</td>
        </tr>
        <tr>
            <th>Rinkeby</th>
            <td>${(rinkebyBalance.balance / 1e18).toFixed(5) + " ETH"}</td>
        </tr>
    </tbody>
    </table>
    `
}

getNFTs = async () => {
    console.log('Get NFTs clicked');
    let nfts = await Moralis.Web3API.account.getNFTs({ chain: "rinkeby" });
    console.log(nfts);
    let tableOfNFTs = document.querySelector('#tableOfNFTs');

    if(nfts.result.length > 0) {
        nfts.result.forEach(n => {
           let metadata = JSON.parse(n.metadata); 
           let content = `
           <div class="card col-md-3">
               <img src="${fixURL(metadata.image)}" class="card-img-top" height=300>
               <div class="card-body">
                   <h5 class="card-title">${metadata.name}</h5>
                   <p class="card-text">${metadata.description}</p>
               </div>
           </div>
           `
           tableOfNFTs.innerHTML += content;
        })
    }
}

fixURL = (url) => {
    if (url.startsWith("ipfs")) {
        return "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1);
    }
    else {
        return url + "?format=json"
    }
}


millisecondsToTime = (ms) => {
    let minutes = Math.floor(ms / (1000 *60));
    let hours = Math.floor(ms / (1000 * 60 * 60));
    let days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if(days <1) {
        if(hours < 1){
            if(minutes < 1){
                return `less than a minute ago`
            } else return `${minutes} minutes(s) ago`
        } else return `${hours} hours(s) ago`
    } else return `${days} days(s) ago`
}

if(document.querySelector('#btn-login') != null)
{
    document.querySelector('#btn-login').onclick = login;
}

if(document.querySelector('#btn-logout') != null)
{
    document.querySelector('#btn-logout').onclick = logout;
}

if(document.querySelector('#get-transactions-link') != null)
{
    document.querySelector('#get-transactions-link').onclick = getTransactions;
}

if(document.querySelector('#get-balances-link') != null)
{
    document.querySelector('#get-balances-link').onclick = getBalances;
}

if(document.querySelector('#get-nfts-link') != null)
{
    document.querySelector('#get-nfts-link').onclick = getNFTs;
}
