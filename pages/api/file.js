import formidable from "formidable";
import fs from "fs";
const csv = require('csvtojson')


export const config = {
  api: {
    bodyParser: false
  }
};

export const TTL = (filePath, ttlTime = 3600 /* 1 hours by default */)=>{
  setTimeout( async ()=>{
    await fs.unlinkSync(filePath);
  },ttlTime*1000);
}


const webhookPayloadParser = (req) => new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(Buffer.from(data).toString());
    });
});

export const CSVTOJSON = async (filePath)=>{
  const JSONDATA = await csv().fromFile(filePath);
  const destinationPath = filePath.replace('.csv','.json');
  fs.writeFileSync(destinationPath,JSON.stringify(JSONDATA));
  return {location:destinationPath, data: JSONDATA.slice(0, 5)};
}

export default async function handler(req, res) {
  if(req.method==='POST'){
    try{
      const form = new formidable.IncomingForm();
      form.parse(req, async function (err, fields, files) {
        const destinationPath = `./public/uploads/${files.file.originalFilename}`;
        await fs.writeFileSync(destinationPath, fs.readFileSync(files.file.filepath));
        await fs.unlinkSync(files.file.filepath);
        const CSVJSON_Response = await CSVTOJSON(destinationPath);
        await fs.unlinkSync(destinationPath);
        TTL(CSVJSON_Response.location);
        return res.status(201).json({status:true,msg:'Successfully uploaded!',jsonData:CSVJSON_Response.data,jsonFile:CSVJSON_Response.location.replace('./public','')});
      });
    }catch(e){
      console.log('Error while uploading',e);
      return res.json({status:false, err: e});
    }
  } else if (req.method==='DELETE'){
    let response = await webhookPayloadParser(req);
    req.body = JSON.parse(response);
    try { 
      let {file =false} = req.body;
      if(file){
        const destinationPath = `./public/uploads/${file}`;
        await fs.unlinkSync(destinationPath); 
        return res.status(200).json({status:true,msg:'Successfully Deleted!'});
      }
    } catch(e){
      console.log('Error while Deleting',e);
      return res.json({status:false, err: e});
    }
  }
}
