import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType,  getAssociatedTokenAddressSync,  getMintLen, LENGTH_SIZE, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, TYPE_SIZE } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useState } from 'react';

export function TokenLaunchPad() {
    const wallet = useWallet();
    const { connection } = useConnection();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        imageUrl: '',
        supply: ''
    });

    // First, add a function to check if all fields are filled
    const isFormValid = () => {
        return formData.name.trim() !== '' && 
               formData.symbol.trim() !== '' && 
               formData.imageUrl.trim() !== '' && 
               formData.supply.trim() !== '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!wallet.connected) {
                throw new Error("Wallet not connected");
            }
            
            // Call createToken and wait for it to complete
            await createToken();
            alert('Token created successfully!');
        } catch (error) {
            console.error('Error creating token:', error);
            alert(error instanceof Error ? error.message : 'Failed to create token');
        } finally {
            setIsLoading(false);
        }
    };

    async function createToken() {
        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: 'G07',
            symbol: 'SG',
            uri: "https://cdn.100xdevs.com/metadata.json",
            additionalMetadata:[]
        }

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey!,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey!, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                 programId: TOKEN_2022_PROGRAM_ID,
                 mint: mintKeypair.publicKey,
                 metadata: mintKeypair.publicKey,
                 name: metadata.name,
                 symbol: metadata.symbol,
                 uri: metadata.uri,
                 mintAuthority: wallet.publicKey!,
                 updateAuthority: wallet.publicKey!,
            })
        );

        if (wallet.publicKey) {
            transaction.feePayer = wallet.publicKey;
        } else {
            throw new Error('Wallet public key is null');
        }
         transaction.feePayer = wallet.publicKey!;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);

        console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey!,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        console.log(associatedToken.toBase58());

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );
        await wallet.sendTransaction(transaction2, connection);

        const transaction3 = new Transaction().add(
            createMintToInstruction(
                mintKeypair.publicKey,
                associatedToken,
                wallet.publicKey,
                1000000000,
                [],
                TOKEN_2022_PROGRAM_ID

            )
        )
        await wallet.sendTransaction(transaction3, connection);
        console.log(`Token minted to ${associatedToken.toBase58()}`);
        
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full mix-blend-screen filter blur-xl opacity-70 animate-pulse"
                        style={{
                            background: `radial-gradient(circle, ${
                                ['#4F46E5', '#7C3AED', '#2DD4BF'][i]
                            } 0%, transparent 70%)`,
                            width: `${300 + i * 100}px`,
                            height: `${300 + i * 100}px`,
                            top: `${30 + i * 20}%`,
                            left: `${20 + i * 30}%`,
                            animation: `floating ${4 + i}s ease-in-out infinite`
                        }}
                    />
                ))}
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                {/* Form Section */}
                <div className="glass rounded-2xl shadow-2xl overflow-hidden p-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                            Create Your Token
                        </h2>
                        <p className="text-teal-300/80">Launch your token in minutes</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Token Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter token name"
                                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Symbol
                            </label>
                            <input
                                type="text"
                                placeholder="Enter token symbol"
                                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <input
                                type="text"
                                placeholder="Enter token image URL"
                                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Initial Supply
                            </label>
                            <input
                                type="number"
                                placeholder="Enter initial supply"
                                className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                                value={formData.supply}
                                onChange={(e) => setFormData({ ...formData, supply: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !wallet.connected || !isFormValid()}
                            className="w-full flex justify-center py-4 px-6 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 hover:from-teal-600 hover:via-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 relative overflow-hidden"
                        >
                            <span className="relative z-10">
                                {!wallet.connected 
                                    ? 'Connect Wallet' 
                                    : !isFormValid() 
                                        ? 'Fill All Fields' 
                                        : isLoading 
                                            ? 'Creating...' 
                                            : 'Create Token'
                                }
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </form>
                </div>

                {/* Preview Card - Updated with floating effect */}
                <div className="glass rounded-2xl shadow-2xl overflow-hidden p-8 floating">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <span className="w-2 h-2 bg-teal-400 rounded-full mr-2 pulse-ring" />
                        Token Preview
                    </h3>
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl p-8 shadow-xl border border-white/5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center">
                            {formData.imageUrl ? (
                                <img src={formData.imageUrl} alt="Token" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-2xl text-white">{formData.symbol?.slice(0, 2) || '?'}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-white">{formData.name || 'Token Name'}</h4>
                            <p className="text-gray-400">{formData.symbol || 'SYMBOL'}</p>
                            <p className="text-gray-400 mt-2">Supply: {formData.supply || '0'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}