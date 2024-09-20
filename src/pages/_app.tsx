import './index.scss';
import { default as NextApp } from 'next/app';
import Head from 'next/head';

function App(data: any) {
    const { Component, pageProps } = data;
    return (
        <>
            <Head>
                <title>Block explorer (Zarcanum)</title>
                <meta name="description" content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability" />
                <meta name="viewport" content="width=device-width, initial-scale=1  user-scalable=no" />
                <link rel="icon" href="/favicon.ico" />

                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://explorer.zano.org/"/>
                <meta property="og:title" content="Block explorer (Zarcanum)"/>
                <meta property="og:description" content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability"/>
                <meta property="og:image" content="social-banner.png"/>

                <meta property="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content="https://explorer.zano.org/"/>
                <meta property="twitter:title" content="Block explorer (Zarcanum)"/>
                <meta property="twitter:description" content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability"/>
                <meta property="twitter:image" content="social-banner.png"/>
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default App;