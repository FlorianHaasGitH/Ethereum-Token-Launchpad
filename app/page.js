"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Header from "./components/Header";
import List from "./components/List";
import Token from "./components/Token";
import Trade from "./components/Trade";
import Footer from "./components/Footer";

// ABIs & Config
import Factory from "./abis/Factory.json";
import config from "./config.json";
import images from "./images.json";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);

  async function loadBlockchainData() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();

    const factory = new ethers.Contract(
      config[network.chainId].factory.address,
      Factory,
      provider
    );

    const fee = await factory.fee();
    console.log("fee", fee);
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />
    </div>
  );
}
