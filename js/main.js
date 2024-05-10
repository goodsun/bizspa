const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const status = document.getElementById('status');
let connected = null;
connectButton.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);

            const signer = provider.getSigner();
            connected = await signer.getAddress();

            status.innerHTML = `connected: ${connected}`;
        } catch (error) {
            status.innerHTML = `error: ${error.message}`;
        }
    } else {
        status.innerHTML = 'get MetaMask';
    }
});

disconnectButton.addEventListener('click', async () => {
  if (connected){
    status.innerHTML = 'connect wallet';
    connected = null;
    updateDisplay();
  }
});

const check = () => {
  if (connected){
    alert('connected' + connected);
  }else{
    alert('not connected'); 
  }
}

const updateDisplay = () => {
  if (connected){
    console.log('UD: connected' + connected);
  }else{
    console.log('UD: not connected'); 
  }
}
