import { ethers } from "ethers";
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");
const checkButton = document.getElementById("checkButton");
const status = document.getElementById("status");
let connected = null;

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      connected = await signer.getAddress();

      status.innerHTML = `connected: ${connected}`;
    } catch (error) {
      status.innerHTML = `error: ${error.message}`;
    }
  } else {
    status.innerHTML = "get MetaMask";
  }
});

disconnectButton.addEventListener("click", async () => {
  if (connected) {
    status.innerHTML = "connect wallet";
    connected = null;
    updateDisplay();
  }
});

checkButton.addEventListener("click", async () => {
  updateDisplay();
});

const updateDisplay = () => {
  if (connected) {
    console.log("UD: connected" + connected);
  } else {
    console.log("UD: not connected");
  }
};
