import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import React, { useEffect, useState } from 'react';
import { saveAs } from "file-saver";
import styles from '../../styles/codeEditor.module.css';

const CODE_EDITOR = ({files=[]})=>{
    let initialCode = 'After Processing Please Return the result to check in output \n If you have uploaded Excel sheets then <--File*[SHEET_NAME]--> can be used to access its data.';
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
        if(!downloading){
            setDownloading(true);
            const response = await fetch("/api/csv", {
                method: "POST",
                body: JSON.stringify({files, code}),
            }).then(res=>res.json())
            .catch(e=>{
                console.log('Error While Downloading', e);
                setOutput(`> Error While Downloading -> ${e.message || e}`);
            });
            if(response){
                if(response.status){
                    saveAs(response.result,'OUTPUT.csv');
                }else {
                    setOutput(`> Error -> ${JSON.stringify(response.err)}`);
                }
            }
            setDownloading(false);
        } 
    }
    const execute = async ()=>{
        try{
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            let Executor=  new AsyncFunction(code);
            let result = await Executor();
            if(typeof result === 'object') result = JSON.stringify(result,null,'\t');
            setOutput(`> ${result ? result : 'Error -> "Something should be returned from the code!!"'}`);
        }catch(e){
            console.log('Error while Code Execution!',e);
            setOutput(`> Error -> "${e.message || e}"`);
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
                        outline: 'none',
                        minHeight: '500px',
                        marginTop:'36px',
                        height: 'auto',
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

export default CODE_EDITOR;