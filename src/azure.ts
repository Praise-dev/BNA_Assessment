// connect-with-default-azure-credential.js
// You must set up RBAC for your identity with one of the following roles:
// - Storage Blob Data Reader
// - Storage Blob Data Contributor
import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME as string;
if (!accountName) throw Error('Azure Storage accountName not found');

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  new DefaultAzureCredential()
);


async function fetchAzureBlobClient(blobName: string, privateContainer: boolean = false) {
    try {
        const containerName = privateContainer? process.env.AZURE_PRIVATE_CONTAINER as string: process.env.AZURE_PUBLIC_CONTAINER as string ;

        // create container client
        const containerClient = await blobServiceClient.getContainerClient(
            containerName
        );

        // create blob client
        const blobClient = await containerClient.getBlockBlobClient(blobName);
        return blobClient;

    } catch(err){
        throw err;
    }
}


export default fetchAzureBlobClient;