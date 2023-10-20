import { ServerResponse, IncomingMessage } from "http";
import fs from "fs";
import fetchAzureBlobClient from "./azure"
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Given a file, upload to Azure public container
 * @param req 
 * @param res 
 */
const uploadFile = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: any[] = [];
    
    req.on('data', (data) => {
      chunks.push(data);
    });

    req.on('end', async () => {
      try{
        const payload = Buffer.concat(chunks);
        const blobName = `blob-file-${Date.now()}.png`
        let blobClient = await fetchAzureBlobClient(blobName);
        await blobClient.uploadData(payload);
        res.writeHead(201, {'Content-Type': 'text/html'});
        res.end({
          message : `Successfully uploaded file - ${blobName} to public domain`
        })
      } catch (err) {
        res.statusCode = 500;
        res.end({
          message: "Internal Server Error"
        })
      }
       
    });

}


/**
 * Given a private file, upload to Azure private container
 * @param req 
 * @param res 
 */
const uploadPrivateFile = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: any[] = [];
    
    req.on('data', (data) => {
      chunks.push(data);
    });

    req.on('end', async () => {
      try{
        const payload = Buffer.concat(chunks);
        const blobName = `blob-file-${Date.now()}.png`
        let blobClient = await fetchAzureBlobClient(blobName, true);
        await blobClient.uploadData(payload);
        res.writeHead(201, {'Content-Type': 'text/html'});
        res.end({
          message : `Successfully uploaded file - ${blobName} to private domain`
        })
      } catch (err) {
        res.statusCode = 500;
        res.end({
          message: "Internal Server Error"
        })
      }

    });
}


// retrieve both private and public files uploaded
const getFile = async (req: IncomingMessage, res: ServerResponse) => {
    try{
      let parsedUrl = new URL(String(req.url), `http://${req.headers.host}`); 
      let paths = parsedUrl.pathname.split("/")

      if (paths.length && paths.length == 1) {
          return await getPublicFile(req, res, paths);
        }

      else if (paths.length && paths.length == 2 ) {
          return await getPrivateFile(req, res, paths);
        }

      else {
          res.writeHead(404, {'Content-Type': 'text/html'});
          res.statusMessage = "Path not found";
          res.end();
      }
    } catch (error){
      res.writeHead(500, {'Content-Type': 'text/html'});
        res.end({message: "Internal Server Error"})
    }
}


/**
 * GET :private-key/:file-id/
 * @param req 
 * @param res 
 * @param paths [file-id]
 */
const getPublicFile = async (req: IncomingMessage, res: ServerResponse, paths: Array<string>) => {
  try{
      const blobName = paths[0];
      const blobClient = await fetchAzureBlobClient(blobName);

      const downloadResponse = await blobClient.download();
      const writableStream = fs.createWriteStream(blobName)
    
      if (!downloadResponse.errorCode && downloadResponse?.readableStreamBody) {
        downloadResponse.readableStreamBody.pipe(writableStream);
        console.log(`download of ${blobName} succeeded`);
        res.writeHead(200, {'Content-Type': 'application/octet-stream'});
        res.end(writableStream);
      }else {
        throw Error('An error occured')
      }
    } catch (error){
        res.statusCode = 500;
        res.end({ message: `Internal server error`})
  }
}


/**
 * GET :private-key/:file-id/
 * @param req 
 * @param res 
 * @param paths [private-key, file-id]
 */
const getPrivateFile = async (req: IncomingMessage, res: ServerResponse, paths: Array<string>) => {
  try{
    const [privateKey, blobName] = paths;
    if ( privateKey === process.env.AZURE_PRIVATE_KEY as string ){
      const blobClient = await fetchAzureBlobClient(blobName, true);
  
      const downloadResponse = await blobClient.download();
      const writableStream = fs.createWriteStream(blobName)
      if (!downloadResponse.errorCode && downloadResponse?.readableStreamBody) {
        downloadResponse.readableStreamBody.pipe(writableStream);
        console.log(`download of ${blobName} succeeded`);
        res.writeHead(200, {'Content-Type': 'application/octet-stream'});
        res.end(writableStream);
      } else {
        throw Error('An error occured')
      }
    } else {
      res.statusCode = 401;
      res.end({message: "Unauthorized access to private domain"})
    }
  } catch (error){
      res.statusCode = 500;
      res.end({ message: `Internal server error`})
  }
}


export { uploadFile, uploadPrivateFile, getFile}