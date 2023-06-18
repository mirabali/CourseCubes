//shapes, dimension of slide: prop
//shape ke prop: lcoation size, slide ke dimension, shape type, shape data
import { Box, Paper, Typography, TextField, Button, Grid, Container } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";

//Helper function to convert Inches and Pt (font) to Emu (the standard measurement of OpenXML)
function EmuToPixel() {
    //Usage: 12 Inches --> INCHES(12), 40 pt = PT(40);
    //INCHES = lambda inches: int(inches * 914400);
    //PT = lambda p: int(p * 12700);
}



function TextBox(props) {

    console.log("PROPS>DATA", props.data)
    return (
        <>
            {props.data.type === "Title" ?
                (<div id="outlined-basic" border="1px solid" style={{ display: "flex", flexDirection: "row", justifyContent: "center", width: "100%" }}>
                    <Typography fontSize="25px" font="Inter" align="center">{props.data.text}</Typography>
                </div>) :
                (<div id="outlined-basic" border="1px solid" style={{ display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
                    <Typography fontSize="14px" font="Inter" align="left">{props.data.text}</Typography>
                </div>)

            }
        </>
    )
}

export default TextBox;
