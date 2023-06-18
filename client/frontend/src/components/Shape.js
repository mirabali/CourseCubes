//shapes, dimension of slide: prop
//shape ke prop: lcoation size, slide ke dimension, shape type, shape data
import { Box, Paper, Typography, TextField, Button, Grid, Container } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";
import Image from "../components/Image";
import Video from "../components/Video";
import MCQ from "../components/MCQ";
import TextBox from "../components/TextBox";

function ratioCalculation(shapeLocation, shapeSize, presentationDimension) {
    //used to figure out locations of textboxes and thus text

    var x_dim = presentationDimension[0]; //presentation x
    var y_dim = presentationDimension[1]; //presentation y
    var left = (shapeLocation[0] / x_dim); //from the left edge of screen
    var top = (shapeLocation[1] / y_dim); //from the top edge
    var width = (shapeSize[0] / x_dim); //length of a rectangle
    var height = (shapeSize[1] / y_dim); //width of a rectangle
    var temporary = [width, height, left, top];
    for (let i = 0; i < temporary.length; i++) {
        temporary[i] = (temporary[i] * 100).toString() + "%";
    }
    return temporary;
}

function Shape(props) {
    const [param_width, param_height, param_left, param_top] = ratioCalculation(props.shape.location, props.shape.size, props.slideSize);
    const figma_x = 804;
    const figma_y = 452;
    console.log("props.shape", props.shape);

    return (
        <>
            <Container sx={{ width: param_width, height: param_height, right: param_left, top: param_top, position: "absolute", margin: '0px', display: "flex", alignItems: "center" }}>
                {props.shape.type === "TextBox" ?
                    (<TextBox slideDimension={props.slideSize} data={props.shape.data} location={props.shape.location} size={props.shape.size} />) :
                    props.shape.type === "MCQ" ?
                        (<MCQ></MCQ>) :
                        props.shape.type === "Video" ?
                            (<Video></Video>) :
                            (<Image></Image>)}
            </Container>


        </>
    )
}

export default Shape;
