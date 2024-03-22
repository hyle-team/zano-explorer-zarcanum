import "./TransactionPool.scss";
import { useState, useEffect } from "react";
import Button from "../../../../components/UI/Button/Button";
import Table from "../../../../components/default/Table/Table";
import AliasText from "../../../../components/default/AliasText/AliasText";
import { socket } from "../../../../utils/socket";

function TransactionPool() {

    interface PoolElement {
        blob_size: string,
        fee: string,
        id: string,
        timestamp: string,
    }

    const [turnedOn, setTurnedOn] = useState(true);

    const [poolElements, setPoolElements] = useState<PoolElement[]>([]);

    const tableHeaders = [ "TIMESTAMP (UTC)", "AGE", "SIZE", "FEE", "HASH" ];

    useEffect(() => {
        socket.on("get_transaction_pool_info", (data) => {
            try {
                data = JSON.parse(data);
                console.log(data);
                
                setPoolElements(data);
            } catch (error) {
                console.error(error);
            }
        });

        socket.emit("get-socket-pool");

        return () => {
            socket.off("get_transaction_pool_info");
        };
    }, []);

    function timestampToLocalDate(timestamp: number) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    function timeAgo(timestamp: number) {
        const now = new Date().getTime();
        const secondsPast = (now - timestamp) / 1000;
    
        if (secondsPast < 60) {
            return 'just now';
        }
        if (secondsPast < 3600) {
            const minutes = Math.round(secondsPast / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        if (secondsPast <= 86400) {
            const hours = Math.round(secondsPast / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        if (secondsPast > 86400) {
            const days = Math.round(secondsPast / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    const tableElements = poolElements.map((element) => ([
        timestampToLocalDate(parseInt(element.timestamp, 10)*1000),
        timeAgo(parseInt(element.timestamp, 10)*1000),
        element.blob_size + " bytes",
        parseInt(element.fee, 10)/10**12,
        <AliasText href={`/transaction/${element.id}`}>{element.id}</AliasText>
    ]));

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
            {!turnedOn || !tableElements[0] ?
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