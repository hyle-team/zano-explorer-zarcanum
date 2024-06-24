import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Block from "./pages/Block/Block";
import { NET_MODE } from "./config/config";

const Blockchain = React.lazy(() => import("./pages/Blockchain/Blockchain"));
const AltBlocks = React.lazy(() => import("./pages/AltBlocks/AltBlocks"));
const Aliases = React.lazy(() => import("./pages/Aliases/Aliases"));
const API = React.lazy(() => import("./pages/API/API"));
const Transaction = React.lazy(() => import("./pages/Transaction/Transaction"));
const Charts = React.lazy(() => import("./pages/Charts/Charts"));
const ChartsPage = React.lazy(() => import("./pages/ChartPage/ChartPage"));
const Assets = React.lazy(() => import("./pages/Assets/Assets"));
const Asset = React.lazy(() => import("./pages/Asset/Asset"));

function App() {
    return (
        <Router>
            <Suspense fallback={<></>}>
                <Routes>
                    <Route path="/" element={<Blockchain />} />
                    <Route path="/alt-blocks" element={<AltBlocks />} />
                    <Route path="/aliases" element={<Aliases />} />
                    <Route path="/zano_api" element={<API />} />
                    <Route path="/block/:hash" element={<Block />} />
                    <Route path="/transaction/:hash" element={<Transaction />} />
                    <Route path="/alt-blocks/:hash" element={<Block alt />} />
                    <Route path="/charts" element={<Charts />} />
                    <Route path="/charts/:name" element={<ChartsPage />} />
                    {/* {NET_MODE === "TEST" &&
                        <Route path="/assets" element={<Assets />} />
                    } */}
                    <Route path="/assets" element={<Assets />} />
                    <Route path="/*" element={<Navigate to="/" />} />
                    {/* <Route path="/assets/:id" element={<Asset />} /> */}
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
