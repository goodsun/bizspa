export interface attributes {
  trait_type: string;
  value: string;
}

export interface nftMetaData {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  attributes: attributes[];
}

export interface iVault {
  name: string;
  uri: string;
  arweaveUrl: string;
  viewblockUrl: string;
}
