import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import React, { useEffect, useState } from 'react';
import { saveAs } from "file-saver";
import styles from '../../styles/codeEditor.module.css';

export default ({files=[]})=>{
    let initialCode = 'After Processing Please Return the result to check in output';
    let [code,setCode] = useState(`/*\n ${initialCode} \n*/`);
    const [CSV_UTIL_OUTPUT,setOutput] = useState('>');
    const [downloading,setDownloading] = useState(false);
    
    useEffect(()=>{
        let fileVars = files.map((f,i)=>{
            let variable = `File${i+1}`;
            window[variable] = f.data;
            return ` var File${i+1}; // SET FROM ${f.file.name}`;
        }).join('\n');
        setCode(`/*\n ${initialCode}\n${fileVars} \n*/`);
        setOutput('>');
    },[files])


    const download = async ()=>{
        // if(!downloading){
            setDownloading(true);
            const response = await fetch("/api/csv", {
                method: "POST",
                body: JSON.stringify({files, code}),
            }).then(res=>res.json()).catch(e=>console.log('Error While Downloading', e));
            console.log('DATA',response);
            saveAs(response.result,'OUTPUT.csv');
            setDownloading(false);
        // } 
    }
    const execute = ()=>{
        try{
            let Executor= new Function(code);
            let result = Executor();
            if(typeof result === 'object') result = JSON.stringify(result,null,2);
            setOutput(`> ${result}`);
        }catch(e){
            console.log(e);
            setResult(false);
            setOutput(`> Error -> ${e}`);
        }
    };
    return <React.Fragment>
            <div className={styles.wrapper}>
                <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => highlight(code, languages.js)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        border:'1px solid black',
                        margin:'16px',
                        marginTop:'36px',
                        height: '500px',
                        overflowY: 'scroll'
                    }}
                />
                <div className={styles.output}>{CSV_UTIL_OUTPUT}</div>
            </div>
            <div className={styles.wrapper}>
                <button className={styles.execute} onClick={execute}>Execute</button>
                <button className={styles.download} onClick={download}>{downloading ? 'Downloading...' : 'Download' }</button>
            </div>
        </React.Fragment>
}