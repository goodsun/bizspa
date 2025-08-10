import { ethers } from 'ethers';
import { showRPCModal, hideRPCModal } from '../snipet/rpcModal';
import { bizenCache, BIZEN_CACHE_CONFIG } from './bizenCache';

export async function wrapRPCCall<T>(
    contractOrProvider: ethers.Contract | ethers.Provider,
    method: string,
    args: any[],
    options?: {
        contractAddress?: string;
        functionName?: string;
        decodedCallInfo?: any;
    }
): Promise<T> {
    const isContract = contractOrProvider instanceof ethers.Contract;
    const contractAddress = isContract ? (contractOrProvider as ethers.Contract).target.toString() : options?.contractAddress;
    const functionName = isContract ? method : options?.functionName;
    
    // スマートコントラクトの場合、実際のRPCメソッドとパラメータを構築
    let rpcMethod = method;
    let displayParams: any = {};
    
    if (isContract) {
        // eth_callまたはeth_sendTransactionとして実行される
        rpcMethod = 'eth_call';
        // 関数名と引数を表示
        displayParams = {
            function: method,
            args: args.map((arg, index) => {
                if (typeof arg === 'string' && arg.startsWith('0x') && arg.length === 42) {
                    return `address: ${arg}`;
                } else if (typeof arg === 'object' && arg !== null && arg._isBigNumber) {
                    return `BigNumber: ${arg.toString()}`;
                } else if (typeof arg === 'bigint') {
                    return `bigint: ${arg.toString()}`;
                }
                return arg;
            })
        };
    } else {
        // プロバイダーメソッドの場合
        if (options?.decodedCallInfo) {
            // callメソッドの詳細情報を表示
            displayParams = {
                to: options.decodedCallInfo.to,
                functionSelector: options.decodedCallInfo.functionSelector,
                from: options.decodedCallInfo.from
            };
        } else if (args.length > 0 && typeof args[0] === 'object' && args[0].to) {
            // 通常のcallメソッド
            const callParams = args[0];
            displayParams = {
                to: callParams.to,
                data: callParams.data ? `${callParams.data.substring(0, 10)}...` : 'none',
                from: callParams.from || 'default'
            };
        } else {
            // その他のメソッド
            displayParams = args.length === 1 && typeof args[0] !== 'object' 
                ? { value: args[0] }
                : { params: args };
        }
    }
    
    console.log('RPC Call Debug:', {
        method: rpcMethod,
        displayParams,
        contractAddress,
        functionName,
        originalArgs: args
    });
    showRPCModal(rpcMethod, displayParams, contractAddress, functionName);
    
    try {
        let result: T;
        
        if (isContract) {
            const contract = contractOrProvider as ethers.Contract;
            result = await contract[method](...args);
        } else {
            const provider = contractOrProvider as ethers.Provider;
            result = await (provider as any)[method](...args);
        }
        
        return result;
    } finally {
        hideRPCModal();
    }
}

export function createWrappedContract(
    contract: ethers.Contract
): ethers.Contract {
    return new Proxy(contract, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            
            if (typeof value === 'function' && typeof prop === 'string') {
                const originalMethod = value;
                
                return async function(...args: any[]) {
                    if (prop === 'connect' || prop === 'attach' || prop === 'on' || prop === 'off' || 
                        prop === 'once' || prop === 'emit' || prop === 'removeAllListeners' ||
                        prop === 'queryFilter' || prop === 'interface') {
                        return originalMethod.apply(target, args);
                    }
                    
                    // キャッシュチェック
                    const contractAddress = target.target.toString();
                    const cacheKey = bizenCache.generateCacheKey(prop, args, contractAddress);
                    const ttl = BIZEN_CACHE_CONFIG[prop];
                    
                    // 読み取り専用メソッドかチェック（書き込みメソッドはキャッシュしない）
                    const isReadMethod = !prop.startsWith('set') && !prop.startsWith('mint') && 
                                       !prop.startsWith('burn') && !prop.startsWith('transfer') && 
                                       !prop.startsWith('approve') && prop !== 'safeMint' &&
                                       prop !== 'grantRole' && prop !== 'revokeRole';
                    
                    if (isReadMethod && ttl !== undefined) {
                        const cached = await bizenCache.get(cacheKey);
                        if (cached !== null) {
                            console.log(`Cache hit: ${prop} on ${contractAddress}`);
                            return cached;
                        }
                    }
                    
                    // スマートコントラクトのメソッド呼び出しを直接表示
                    const displayInfo = {
                        contract: contractAddress,
                        method: prop,
                        params: args.length > 0 ? args : 'none'
                    };
                    
                    console.log('Smart Contract Call:', {
                        contractAddress,
                        method: prop,
                        args,
                        displayInfo
                    });
                    
                    showRPCModal(prop, displayInfo, contractAddress, prop);
                    
                    try {
                        setSmartContractFlag(true);
                        const result = await originalMethod.apply(target, args);
                        
                        // 結果をキャッシュに保存
                        if (isReadMethod && ttl !== undefined && result !== undefined) {
                            await bizenCache.set(cacheKey, result, ttl, 'contract');
                        }
                        
                        return result;
                    } finally {
                        setSmartContractFlag(false);
                        hideRPCModal();
                    }
                };
            }
            
            return value;
        }
    });
}

// スマートコントラクト経由の呼び出しかどうかを追跡
 let isFromSmartContract = false;

export function setSmartContractFlag(flag: boolean) {
    isFromSmartContract = flag;
}

export function createWrappedProvider(
    provider: ethers.Provider
): ethers.Provider {
    return new Proxy(provider, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);
            
            if (typeof value === 'function' && typeof prop === 'string') {
                const originalMethod = value;
                
                const wrappedMethods = [
                    'getBalance',
                    'getTransactionCount',
                    'getCode',
                    'getStorage',
                    'call',
                    'estimateGas',
                    'getBlock',
                    'getTransaction',
                    'getTransactionReceipt',
                    'getLogs',
                    'getNetwork',
                    'getFeeData',
                    'send'
                ];
                
                if (wrappedMethods.includes(prop)) {
                    return async function(...args: any[]) {
                        // スマートコントラクト経由の呼び出しの場合はスキップ
                        if (isFromSmartContract) {
                            return originalMethod.apply(target, args);
                        }
                        
                        // 直接Providerメソッドが呼ばれた場合のみ表示
                        // callメソッドの場合は特別な処理
                        if (prop === 'call' && args.length > 0 && typeof args[0] === 'object') {
                            const txParams = args[0];
                            const decodedInfo: any = {
                                to: txParams.to,
                                from: txParams.from || 'default',
                            };
                            
                            // dataフィールドから関数セレクタを抽出
                            if (txParams.data && txParams.data.length >= 10) {
                                decodedInfo.functionSelector = txParams.data.substring(0, 10);
                                decodedInfo.encodedParams = txParams.data.substring(10);
                            }
                            
                            return wrapRPCCall(
                                target,
                                prop,
                                args,
                                {
                                    functionName: prop,
                                    contractAddress: txParams.to,
                                    decodedCallInfo: decodedInfo
                                }
                            );
                        }
                        
                        return wrapRPCCall(
                            target,
                            prop,
                            args,
                            {
                                functionName: prop
                            }
                        );
                    };
                }
                
                return originalMethod.bind(target);
            }
            
            return value;
        }
    });
}