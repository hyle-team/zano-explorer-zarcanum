import { StoreProvider } from "@/store/store-reducer";
import "./index.scss";
import { AppProps, default as NextApp } from "next/app";
import Head from "next/head";
import NetMode from "@/interfaces/common/NetMode";
import Layout from "./Layout";

interface AppCustomProps extends AppProps {
  netMode: NetMode;
}

function App(data: AppCustomProps) {
  const { Component, pageProps, netMode } = data;
  return (
    <>
      <Head>
        <title>Zano Block Explorer</title>
        <meta
          name="description"
          content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1  user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://explorer.zano.org/" />
        <meta property="og:title" content="Zano Block Explorer" />
        <meta
          property="og:description"
          content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability"
        />
        <meta
          property="og:image"
          content={
            netMode === "MAIN"
              ? "social-banner.png"
              : "social-banner-testnet.png"
          }
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://explorer.zano.org/" />
        <meta property="twitter:title" content="Zano Block Explorer" />
        <meta
          property="twitter:description"
          content="Zano is an open-source cryptocurrency and ecosystem with enterprise-grade privacy, security, and scalability"
        />
        <meta
          property="twitter:image"
          content={
            netMode === "MAIN"
              ? "social-banner.png"
              : "social-banner-testnet.png"
          }
        />
      </Head>
      <StoreProvider
        initial={{ netMode: netMode === "TEST" ? "TEST" : "MAIN" }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </StoreProvider>
    </>
  );
}

App.getInitialProps = async () => {
  return {
    netMode: process.env.NET_MODE === "MAIN" ? "MAIN" : ("TEST" as NetMode),
  };
};

export default App;
