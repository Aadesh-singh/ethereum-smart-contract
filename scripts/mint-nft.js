require("dotenv").config()
const API_URL = process.env.API_URL
const PUBLIC_KEY = process.env.PUBLIC_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY

const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(API_URL)

const contract = require("../artifacts/contracts/MyNFT.sol/MyNFT.json")
const contractAddress = "0x2477ef0b879820dd6228e7a9dc9871f3605b1ddc"
const nftContract = new web3.eth.Contract(contract.abi, contractAddress)
const {pinJSONToIPFS}  = require('./pinata');
// async function mintNFT(tokenURI) {
//     const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce

//     //the transaction
//     const tx = {
//         'from': PUBLIC_KEY,
//         'to': contractAddress,
//         'nonce': nonce,
//         'gas': 500000,
//         'data': nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI()
//     };
//     const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
//     signPromise
//     .then((signedTx) => {
//       web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction,
//         function (err, hash) {
//           if (!err) {
//             console.log(
//               "The hash of your transaction is: ",
//               hash,
//               "\nCheck Alchemy's Mempool to view the status of your transaction!"
//             )
//           } else {
//             console.log(
//               "Something went wrong when submitting your transaction:",
//               err
//             )
//           }
//         }
//       )
//     })
//     .catch((err) => {
//       console.log(" Promise failed:", err)
//     })
// }


// mintNFT("https://gateway.pinata.cloud/ipfs/QmafYv2p9F6Upmgr9vbt8mX2ZfemmLgfaxAAwAsWw5rhNe")


// export const mintNFT = async (url, name, description) => {
const mintNFT = async (url, name, description) => {
    try {
      // error handling
      if (url.trim() == "" || (name.trim() == "" || description.trim() == "")) { 
        return {
        success: false,
        status: "❗Please make sure all fields are completed before minting.",
        }
      }
      const metaData = new Object();
      metaData.name = name;
      metaData.image = url;
      metaData.description = description;

      // make pinata call
      const pinataResponse = await pinJSONToIPFS(metaData);
      if(!pinataResponse.success){
        return {
          success: false,
          status: 'Something went wrong while uploading your tokenURI.'
        }
      }
      const tokenURI  = pinataResponse.pinataUrl;
      console.log('tokenUri', tokenURI)
      //load smart contract
      // global.contract = await new web3.eth.Contract(contract.abi, contractAddress);//loadContract();
      // //set up your Ethereum transaction
      const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce
      const transactionParameters = {
        'nonce': nonce,
        'gas': 500000,
        'to': contractAddress, // Required except during contract publications.
        'from': PUBLIC_KEY, // must match user's active address.
        'data': nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI() //make call to NFT smart contract 
      };
      // //sign transaction via Metamask
      //   try {
      //     const txHash = await window.ethereum
      //         .request({
      //             method: 'eth_sendTransaction',
      //             params: [transactionParameters],
      //         });
      //         return {
      //             success: true,
      //             status: "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" + txHash
      //         }
      //     } catch (error) {
      //       console.log('Error in transaction: ', error);
      //         return {
      //             success: false,
      //             status: "😥 Something went wrong: " + error.message
      //         }
      //     }
      // } catch (error) {
      //   console.log(error);
      //   return;
      // }
      const signPromise = web3.eth.accounts.signTransaction(transactionParameters, PRIVATE_KEY)
      signPromise
      .then((signedTx) => {
        web3.eth.sendSignedTransaction(
          signedTx.rawTransaction,
          function (err, hash) {
            if (!err) {
              console.log(
                "The hash of your transaction is: ",
                hash,
                "\nCheck Alchemy's Mempool to view the status of your transaction!"
              )
            } else {
              console.log(
                "Something went wrong when submitting your transaction:",
                err
              )
            }
          }
        )
      })
      .catch((err) => {
        console.log(" Promise failed:", err)
      })
    } catch(err){
      console.log('Error: ', err);
      return;
    }
}

mintNFT("https://gateway.pinata.cloud/ipfs/QmP5LtvqgnV3BaXr7zxPHXydwKsyvp4LkUv3Pe9dpwXvAs", "Goku", "Fighter");