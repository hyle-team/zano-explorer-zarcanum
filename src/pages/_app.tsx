import './index.scss';
import { default as NextApp } from 'next/app';
import Head from 'next/head';

function App(data: any) {
    const { Component, pageProps } = data;
    return (
        <>
            <Head>
                <title>Zano Trade</title>
                <meta name="description" content="Peer-to-Peer Trading App on Zano blockchain" />
                <meta name="viewport" content="width=device-width, initial-scale=1  user-scalable=no" />
                <link rel="icon" href="/favicon.ico" />

                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://trade.zano.org/"/>
                <meta property="og:title" content="Zano Trade"/>
                <meta property="og:description" content="Peer-to-Peer Trading App on Zano blockchain"/>
                <meta property="og:image" content="social-banner.png"/>

                <meta property="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content="https://trade.zano.org/"/>
                <meta property="twitter:title" content="Zano Trade"/>
                <meta property="twitter:description" content="Peer-to-Peer Trading App on Zano blockchain"/>
                <meta property="twitter:image" content="social-banner.png"/>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default App;