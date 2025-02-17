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
  return (
    <div className="page">
      <Header
        account={0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266}
        setAccount={""}
      />

      <h1 style={{ padding: "1em" }}>fun.pump</h1>
    </div>
  );
}
