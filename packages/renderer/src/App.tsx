import styles from '@/styles/app.module.scss'
import { useState } from 'react'
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode";
import { ethers } from 'ethers';
import Web3 from "web3";
import { SelfID, EthereumAuthProvider } from './libs/selfID-web'

let self: any
let provider: any

const App = () => {
  const [qrImage, setQRImage] = useState<string>()
  const [connectInfo, setConnectInfo] = useState<any>()
  const [accounts, setAccounts] = useState<string[]>([])

  const connectWallet = () => {
    // // Create a connector
    // const connector = new WalletConnect({
    //   bridge: "https://bridge.walletconnect.org", // Required
    //   qrcodeModal: QRCodeModal,
    // });

    // // Check if connection is already established
    // if (!connector.connected) {
    //   // create new session
    //   console.log('create session')
    //   connector.createSession().then(() => {
    //     QRCode.toDataURL(connector.uri).then((value) => {
    //       console.log(value)
    //       setQRImage(value)
    //     })
    //   }).catch(error => {

    //   })
    // }

    // // Subscribe to connection events
    // connector.on("connect", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }
    //   console.log('connect', payload)
    //   // Get provided accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    // });

    // connector.on("session_update", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }
    //   console.log('session_update', payload)

    //   // Get updated accounts and chainId
    //   const { accounts, chainId } = payload.params[0];
    //   setConnectInfo(payload.params[0])
    // });

    // connector.on("disconnect", (error, payload) => {
    //   if (error) {
    //     throw error;
    //   }
    //   console.log('disconnect', payload)

    //   // Delete connector
    // });
  }


  const createWeb3Provider = async () => {
    const externalProvider = new WalletConnectProvider({
      infuraId: "15cf7dc54d83442b8d376b6317af541b",
      qrcode: false,
    });

    externalProvider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      console.log('display qrcode', payload)
      QRCode.toDataURL(uri).then((value) => {
        console.log(value)
        setQRImage(value)
      })
    });

    provider = externalProvider

    //  Enable session (triggers QR Code modal)
    await externalProvider.enable();
    console.log('enabled', externalProvider.connector.uri)
    console.log('connected', externalProvider.connected)

    const web3 = new Web3(externalProvider as any)
    const accounts = await web3.eth.getAccounts();

    console.log(accounts)
    setAccounts(accounts)
    // const provider = new ethers.providers.Web3Provider(externalProvider);
    // await provider.send('eth_requestAccounts', []);
    // const signer = provider.getSigner();
    // const currentAddress = await signer.getAddress();
    // let ensName = await provider?.lookupAddress(currentAddress);
    // if (!ensName) {
    //   ensName = formatAddress(currentAddress);
    // }
    // console.log(currentAddress, ensName)
  }

  const connectCeramic = async () => {
    self = await SelfID.authenticate({
      authProvider: new EthereumAuthProvider(provider, accounts[0]),
      ceramic: 'testnet-clay',
      connectNetwork: 'testnet-clay'
    })
    console.log('self', self)
    const me = await self.get('basicProfile')
    console.log(me)
  }

  const updateProfile = async () => {
    if (self != null) {
      await self.set('basicProfile', { name: 'mingo', description: 'message from test' })
      console.log('ok')
    } else {
      console.log('not ok')
    }
  }


  return (
    <div className={styles.app}>
      <div className={styles.left}>
        <div>
          <button onClick={connectWallet}>connect wallet</button>
        </div>
        <div className={styles.qrcode}>
          <img src={qrImage} width="100%" height="100%" />
        </div>
        <div>
          <button onClick={createWeb3Provider}>create web3 provider</button>
        </div>
        <div>
          <button onClick={connectCeramic}>connect ceramic</button>
        </div>
        <div>
          <button onClick={updateProfile}>updateProfile</button>
        </div>
      </div>
      <div className={styles.right}>

      </div>
    </div>
  )
}

export default App
