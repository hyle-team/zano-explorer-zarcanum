import "./TransactionPool.scss";
import { useState } from "react";
import Button from "../../../../components/UI/Button/Button";
import Table from "../../../../components/default/Table/Table";
import AliasText from "../../../../components/default/AliasText/AliasText";

function TransactionPool() {

    const [turnedOn, setTurnedOn] = useState(false);

    const tableHeaders = [ "TIMESTAMP (UTC)", "AGE", "SIZE", "FEE", "HASH" ];

    const tableElements = Array(10).fill(
        [ 
            "2023-10-07 10:01:51", 
            "3 minutes ago", 
            "0 bytes", 
            "0.01", 
            <AliasText href="/">b861efc1ad2007b4af32e21c4e3edf777c08ccb9632cad7343ea6c94d1245f17</AliasText>
        ]
    );

    return (
        <div className="transaction_pool custom-scroll">
            <div className="transation_pool__title">
                <h3>Transaction Pool</h3>
                <Button 
                    style={ turnedOn ? { color: "#ff5252" } : { color: "#00c853" }}
                    onClick={() => setTurnedOn(!turnedOn)}
                >
                    {turnedOn ? "TURN OFF" : "TURN ON"}
                </Button>
            </div>
            {!turnedOn ?
                <div className="transation_pool__empty">
                    <p>Pool is empty</p>
                </div> :
                <Table 
                    className="transaction__table"
                    headers={tableHeaders}
                    elements={tableElements}
                />
            }
            
        </div>
    )
}

export default TransactionPool;