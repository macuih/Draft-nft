import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import './App.css';

import Header from './Header';
import Home from './Home';
import Create from './Create';
import MyListedItems from './MyListedItems';
import MyPurchases from './MyPurchases';

import NFT from './NFT.json';
import Marketplace from './Marketplace.json';
import addresses from './contract-addresses.json';

// ✅ Move AFTER all imports to avoid import/first warning
window.Buffer = Buffer;

// 🔐 Infura IPFS credentials (consider securing in .env)
const projectId = 'd1e9e90be790484dbe31ae093a8592d7';
const projectSecret = 'cgQrPu1cXaH1vwPKhKoaXD+/x+hRwZKeNeb6WMjfzKoskifx/IhL0Q';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

// Create IPFS client instance
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0',
  headers: {
    authorization: auth,
  },
});

function App() {
  const [account, setAccount] = useState('');
  const [nftContract, setNFTContract] = useState(null);
  const [marketplaceContract, setMarketplaceContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBlockchainData = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not found. Please install MetaMask to use this DApp.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      const nft = new ethers.Contract(addresses.nft, NFT.abi, signer);
      const marketplace = new ethers.Contract(addresses.marketplace, Marketplace.abi, signer);

      setAccount(account);
      setNFTContract(nft);
      setMarketplaceContract(marketplace);
      setLoading(false);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" />
        <p className="mx-3 my-0">Connecting to blockchain...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header account={account} />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              marketplace={marketplaceContract}
              nft={nftContract}
              account={account}
            />
          }
        />
        <Route
          path="/create"
          element={
            <Create
              marketplace={marketplaceContract}
              nft={nftContract}
              account={account}
              ipfsClient={ipfsClient}
            />
          }
        />
        <Route
          path="/my-listed-items"
          element={
            <MyListedItems
              marketplace={marketplaceContract}
              nft={nftContract}
              account={account}
            />
          }
        />
        <Route
          path="/my-purchases"
          element={
            <MyPurchases
              marketplace={marketplaceContract}
              nft={nftContract}
              account={account}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
