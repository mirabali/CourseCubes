import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";

function ViewSlide() {
    const params = useParams();
    const presentationId = params["uuidPresentation"];
    const [slideLength, setSlideLength] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(10);
    const [sectionSlide, setSectionSlide] = useState(0);
    const [size, setSize] = useState([]);
    const [location, setLocation] = useState([]);
    const [text, setText] = useState();
    const [slideData, setSlideData] = useState({});
    var currentSlideObj;
    var correctSlideId;
    var fullSize = [];
    var shapesLocation = [];
    var shapesSize = [];
    var shapesText = [];
    var shapeIndex = 0;
    const figma_x = 804;
    const figma_y = 452;
    var dimensions = [];
    var indices = []; //dimensions in pixels, 2d array
}





export default ViewSlide;
