import styles from '../../styles/converter.module.css';
import React, { useRef, useState } from 'react';

const Uploader = ({updateFiles})=>{
    let [loading, setLoading] = useState(false);
    let [fileInfo, setFileInfo] = useState(false);
    const fileInput = useRef();
    const onFileChange = async (e)=>{
        if(e.target.files.length){
            setLoading(true);
            setFileInfo(e.target.files[0]);
            const body = new FormData();
            body.append("file", e.target.files[0]);
            const response = await fetch("/api/file", {
              method: "POST",
              body
            }).then(res=>res.json());
            console.log('RESPONSE',response);
            if(response.status){
                updateFiles(e.target.files[0],response.jsonFile, response.jsonData);
            }
            setLoading(false);
        }
    }
    
    return <React.Fragment>
            <div className={styles.uploader} onClick={()=>!loading && fileInput.current.click()}>
            { loading ? <div className={styles.fileLoader}>
                Loading...
            </div>: (
               <span>
                   +
                   <input ref={fileInput} type="file" className={styles.fileInput} accept=".csv" onChange={onFileChange}/>
                </span>
            )}
            </div>
            
        </React.Fragment>
}


const FileViewer = ({file, updateFiles})=>{
    const deleteFile = async (filename)=>{
        try{
            const response = await fetch("/api/file", {
                method: "DELETE",
                body: JSON.stringify({
                    file: filename
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if(response.status){
                updateFiles()
            }
        } catch(e){
            console.log("ERROR WHILE DELETING", e);
        }
    }
    return  <div className={styles.uploader}>
        <span className={styles.close} onClick={()=>deleteFile(file.name)}>x</span>
        {file.name}
    </div>
}

const CONVERTER = ({files,setFiles})=>{
    return <div className={styles.wrapper}>
        {
            files.map(file=>{
                return <FileViewer key={file.id} file={file.file} updateFiles={()=>setFiles(files.filter(f=>f.id!==file.id))}/> 
            })
        }
        <Uploader updateFiles={(file,location, data)=>setFiles([...files,{id:files.length+1,file,location, data}])}/>
    </div>
}

export default CONVERTER;