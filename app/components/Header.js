import { ethers } from "ethers";

function Header({ account, setAccount }) {
  return (
    <header>
      <p className="brand">fun.pump</p>

      {account ? (
        <button>[{account.slice(0, 6) + "..." + account.slice(38, 42)}]</button>
      ) : (
        <button className="btn--fancy">[ connect ]</button>
      )}
    </header>
  );
}

export default Header;
