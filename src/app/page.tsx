 "use client";

 import { useState, useEffect, ChangeEvent } from 'react';
 import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
 import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
 import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
 import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
 import '@solana/wallet-adapter-react-ui/styles.css';
 import bs58 from 'bs58';
 import { PublicKey } from '@solana/web3.js';
 import Image from 'next/image';
 import solanaLogo from './solanaLogo.png';

 const Home = () => {
   const { wallet } = useWallet();
   const [address, setAddress] = useState('');
   const [userMessage, setUserMessage] = useState('');
   const [response, setResponse] = useState(null);
   const [msg, setMsg] = useState('');
   const { publicKey, signMessage } = useWallet();
   const [currentPage, setCurrentPage] = useState(1);
   const ordersPerPage = 10;

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => setAddress(e.target.value);
  

    const getMinuteTimestamp = () => {
     const now = new Date();
     now.setUTCSeconds(0, 0);
     return now.toISOString();
   };

   const handleGetLimitOrders = async () => {
     if (!address || !publicKey) {
       alert('Please enter a token address and connect your wallet');
       return;
     }

     try {
       const defaultMsg = `Welcome to DEX-Book!\n\nToken Address: ${address}\n\nTimestamp: ${getMinuteTimestamp()}`;
       const encodedMessage = new TextEncoder().encode(defaultMsg);
       const signature = await signMessage(encodedMessage);
       const signatureBase58 = bs58.encode(signature);
       console.log(signatureBase58);
       const response = await fetch(`/api/v1/getOrders/${address}/${signatureBase58}`);
       const data = await response.json();
       setResponse(data.response);
       setMsg(defaultMsg);
       setCurrentPage(1);
       // Save wallet information to localStorage
       localStorage.setItem('wallet', JSON.stringify(publicKey.toBase58()));
     } catch (error) {
       console.error('Error signing message:', error);
     }
   };

   useEffect(() => {
     console.log('Updated response:', response);
   }, [response]);

    useEffect(() => {
     const storedWallet = localStorage.getItem('wallet');
     if (storedWallet) {
       // The wallet will automatically connect if autoConnect is enabled
       localStorage.setItem('wallet', storedWallet);
     }
   }, []);

   const indexOfLastBuyOrder = currentPage * ordersPerPage;
   const indexOfFirstBuyOrder = indexOfLastBuyOrder - ordersPerPage;
   const currentBuyOrders = response?.buyOrders ? response.buyOrders.slice(indexOfFirstBuyOrder, indexOfLastBuyOrder) : [];
   const indexOfLastSellOrder = currentPage * ordersPerPage;
   const indexOfFirstSellOrder = indexOfLastSellOrder - ordersPerPage;
   const currentSellOrders = response?.sellOrders ? response.sellOrders.slice(indexOfFirstSellOrder, indexOfLastSellOrder) : [];

   return (
     <main className="flex min-h-screen flex-col items-center justify-between p-4 lg:p-24 bg-gray-800">
       <div className="w-full lg:max-w-5xl flex justify-start items-center space-x-4">
     {/*    <div className="h-16 w-16 relative">
          <Image src={solanaLogo} alt="Solana Logo" layout="fill" objectFit="contain" />
         </div> */}
       </div>
                 <div className="flex justify-center">
                     <h1 className="flex justify-center mb-3 text-xl lg:text-5xl text-white-500 font-semibold">
                         DEX-Book
                     </h1>
                 </div>
       <div className="mb-8 w-full lg:w-full lg:max-w-5xl">
         <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors">
           <h2 className="flex justify-center mb-3 text-xl lg:text-2xl text-white-500 font-semibold">
             Token Address
           </h2>
           <div className="flex justify-center">
             <input
               type="text"
               value={address}
               onChange={handleAddressChange}
               className="w-1/2 p-2 border rounded text-black mb-4"
               placeholder="Enter token address"
             />
           </div>
           <br />
           <div className="flex justify-center">
             <WalletMultiButton />
           </div>
           <br />
           <div className="flex justify-center">
             <button
               onClick={handleGetLimitOrders}
               className="max-w-xs mt-4 bg-blue-500 text-white p-2 rounded hover:bg-white hover:text-blue-500"
             >
               Get Limit Orders
             </button>
           </div>
         </div>
       </div>
       {msg && (
         <div className="w-full lg:w-full lg:max-w-5xl">
           <h3 className="flex justify-center text-lg lg:text-xl font-semibold text-white-500">Message</h3>
           <br />
           <p className="flex justify-center text-md lg:text-lg text-white">{msg}</p>
         </div>
       )}
       <br />
       <br />
       <br />
       {response && (
         <div className="w-full lg:w-full lg:max-w-5xl border border-blue-300 p-5 electric-border">
           <br />
           <br />
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-8">
             <div>
               <h4 className="flex justify-center text-xl lg:text-2xl font-semibold text-green-500 mb-2">Buy Orders</h4>
               <div className="overflow-x-auto">
                 <table className="w-full table-fixed mt-4 border-collapse border border-gray-300">
                   <thead>
                     <tr>
                       <th className="w-1/5 border border-gray-300 p-2">Amount</th>
                       <th className="w-1/5 border border-gray-300 p-2">Total</th>
                       <th className="w-1/5 border border-gray-300 p-2">Price</th>
                     </tr>
                   </thead>
                   <tbody>
                     {currentBuyOrders.map((item, index) => (
                       <tr key={index}>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-green-500">{item.SellAmount}</td>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-green-500">{item.BuyAmount}</td>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-green-500">{item.Exchange}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
             <div>
               <h4 className="flex justify-center text-xl lg:text-2xl font-semibold text-red-500 mb-2">Sell Orders</h4>
               <div className="overflow-x-auto">
                 <table className="w-full table-fixed mt-4 border-collapse border border-gray-300">
                   <thead>
                     <tr>
                       <th className="w-1/5 border border-gray-300 p-2">Price</th>
                       <th className="w-1/5 border border-gray-300 p-2">Total</th>
                       <th className="w-1/5 border border-gray-300 p-2">Amount</th>
                     </tr>
                   </thead>
                   <tbody>
                     {currentSellOrders.map((item, index) => (
                       <tr key={index}>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-red-500">{item.Exchange}</td>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-red-500">{item.SellAmount}</td>
                         <td className="w-1/2 border border-gray-300 p-2 text-right text-xs text-red-500">{item.BuyAmount}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
           <br />
           <br />
           <div className="flex justify-center">
             <button
               onClick={() => setCurrentPage(currentPage - 1)}
               disabled={currentPage === 1}
               className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-white hover:text-blue-500"
             >
 <i></i>
               Back
             </button>
             <button
               onClick={handleGetLimitOrders}
               className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-white hover:text-blue-500"
             >
 <i></i>
               Refresh
             </button>
             <button
               onClick={() => setCurrentPage(currentPage + 1)}
               disabled={currentPage === Math.ceil(response.buyOrders.length / ordersPerPage)}
               className="bg-blue-500 text-white p-2 rounded mr-2 hover:bg-white hover:text-blue-500"
             >
 <i></i>
               Next
             </button>
           </div>
         </div>
       )}
     </main>
   );
 };

 const App = () => {
   const network = WalletAdapterNetwork.Mainnet;
   const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })];

   return (
     <ConnectionProvider endpoint={`https://quiet-thrilling-bush.solana-mainnet.quiknode.pro/517007fa157e2a1a8f992d28a500588227d9d6f2/`}>
       <WalletProvider wallets={wallets} autoConnect>
         <WalletModalProvider>
           <Home />
         </WalletModalProvider>
       </WalletProvider>
     </ConnectionProvider>
   );
 };

//const App = () => {

//  return (
//    <div>Hello World</div>
//  );
//};

export default App;
