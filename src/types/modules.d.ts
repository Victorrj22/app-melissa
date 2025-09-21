declare module 'expo-asset' {
  export const Asset: any;
}

declare module 'expo-file-system' {
  const FileSystem: any;
  export default FileSystem;
  export const EncodingType: any;
}

declare module '*.txt' {
  const asset: any;
  export default asset;
}
