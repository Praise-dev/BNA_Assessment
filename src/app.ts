import http from "http";
import { getFile, uploadFile, uploadPrivateFile } from "./controller";
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT as string;


const Server = http.createServer(async (req, res) => {

    // POST upload/
    if (req.method == "POST" && req.url == "/upload"){
        return await uploadFile(req, res);
    }

    // POST upload/private
    if (req.method == "POST" && req.url == "/upload/private"){
        return await uploadPrivateFile(req, res);
    }

    // GET
    if (req.method == "GET"){
        return await getFile(req, res);
    }

})

Server.listen(PORT, () => {
    console.log(`Server is running on port 3000. Go to http://localhost:${PORT}/`);
})

Server.close();
