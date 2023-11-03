import "./JsonViewStyled.scss";
import { JsonView, darkStyles, Props } from "react-json-view-lite";
import 'react-json-view-lite/dist/index.css';

function JsonViewStyled(props: Props) {
    return (
        <JsonView 
            {...props}
            style={
                {
                    ...darkStyles,
                    container: "json__container", 
                    basicChildStyle: "json__element",
                    numberValue: "json__number"
                }
            }
        />
    )
}

export default JsonViewStyled;