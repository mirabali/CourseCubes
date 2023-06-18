//shapes, dimension of slide: prop
//shape ke prop: lcoation size, slide ke dimension, shape type, shape data
import { Box, Container } from "@mui/material";
import { useParams } from "react-router-dom";

import Shape from "../components/Shape";

function FullScreenSlide(props) {

    console.log("Miraaa", props);
    return (
        <>
            <Box sx={{ position: "relative" }} border="1px solid #D7D7D7" background="#FFFFFF" boxShadow="-1px -1px 4px rgba(0, 0, 0, 0.1)" boxSizing="border-box">
                {props.shapes.map((shape, i) =>
                    <Shape key={i} shape={shape} slideSize={props.size} />
                )}
            </ Box>

        </>
    )
}

export default FullScreenSlide;
