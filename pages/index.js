import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Converter from '../components/converter';
import CodeEditor from '../components/codeEditor';
import { useState } from 'react';

export default function Home() {
  let [files, setFiles] = useState([]);
  return (
    <div className={styles.container}>
      <Head>
        <title>CSV Utility</title>
        <meta name="description" content="Generate operations with your csvs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span>CSV Utility</span>
        </h1>
        <p className={styles.description}>
          Perform any kind of actions you want to on csv files
        </p>
        <div className={styles.content}>
          <Converter files={files} setFiles={setFiles}/>
          <CodeEditor files={files}/>
        </div>
      </main>

      <footer className={styles.footer}>
          Built by{' '}
          <span className={styles.logo}>
            <a href="https://www.linkedin.com/in/senthur-athiban-181a85b2/" target="_blank" alt="Author" title="Author" rel="noreferrer">Senthur Athiban</a>
          </span>
      </footer>
    </div>
  )
}
