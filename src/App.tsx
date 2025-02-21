import './App.css'
import { TokenLaunchPad } from './components/TokenLaunchPad'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
function App() {
  return (
   <main className="relative bg-[#0A0F1C]">

      <div className="absolute inset-0 topography opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0),rgba(17,24,39,1))]" />
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <div className='flex justify-between'>
                <WalletMultiButton />
                <WalletDisconnectButton className='bg-fuchsia-500' />
              </div>
              <TokenLaunchPad/>
            </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
   </main>
  )
}

export default App
