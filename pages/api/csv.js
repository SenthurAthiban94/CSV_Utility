const { Parser } = require('json2csv');
import fs from 'fs';
import {TTL} from './file';
// const memwatch = require('memwatch');

// memwatch.on('leak', function(info) { 
//     console.log("BEFORE LEAKING", info);
//  });

export default async function handler(req, res) {
    try{
        if(req.method==='POST'){
            const {files=[], code=''} = JSON.parse(req.body);
            let varDeclarations = '';
            await Promise.all(files.map(async(file)=>{
                return new Promise((res,rej)=>{
                    fs.readFile(`./public${file.location}`,'utf-8',(err,data)=>{
                        if(data){
                            varDeclarations+= `var File${file.id}=${data};\n`;
                            TTL(`./public${file.location}`);
                            res(data);
                        } else {
                            rej(err);
                        }
                    });
                });
            }));
            let Executor= new Function(`${varDeclarations}${code}`);
            let JS_OUTPUT = Executor();
            if(JS_OUTPUT){
                const json2csvParser = new Parser();
                const csv = json2csvParser.parse(JS_OUTPUT);
                const destination = './public/outputs/OUTPUT.csv';
                await fs.writeFileSync(destination, csv);
                TTL(destination,1800);
                return res.status(200).json({status: true, result: destination.replace('./public','')});
            } else {
                return res.json({status:false, err: 'Something should be returned from the code!!'});
            }
        }
    } catch(e){
        console.log('Error while Downloading!',e);
        return res.json({status:false, err: e.message || e})
    }
  }