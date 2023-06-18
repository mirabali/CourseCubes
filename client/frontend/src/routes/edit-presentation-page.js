import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import { ReactComponent as Logo } from "../cc_logo.svg";

function EditPresentationPage() {
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

    useEffect(() => {
        fetch("http://127.0.0.1:8000/presentation/" + presentationId + "/", {
            method: "GET"
        }).then((res) => {
            return res.json()
        }).then((res) => {
            console.log("Response" + res["sections"][0].sections[0].slide);
            var numSlides = res.sections.length;
            for (let section of res.sections) {
                if (section.hasOwnProperty("sections")) {
                    numSlides += section.sections.length
                }
            }
            setSlideLength(numSlides);
            //setPresentationData(res);
            if (res !== undefined && res.sections !== undefined) {
                currentSlideObj = res["sections"][currentSlide];
                if ("sections" in currentSlideObj) {
                    correctSlideId = (currentSlideObj["sections"][sectionSlide].slide).replaceAll("-", "");
                    fetch("http://127.0.0.1:8000/slide/" + correctSlideId + "/", {
                        method: "GET"
                    }).then(res => res.json())
                        .then((res) => {
                            //generate(res);
                            setSlideData(res);
                            /*
                            res.shapes.map(shape => {
                                if (shape.shape_type === "TEXT") {
                                    setLocation(shape.location);
                                    setSize(shape.size);
                                    shape.shape_data.paragraphs.map(para => {
                                        para.runs.map()
                                    })
                                }
                            })
                            */
                        })
                } else {
                    fetch("http://127.0.0.1:8000/slide/" + currentSlideObj.slide + "/", {
                        method: "GET"
                    }).then(res => res.json())
                        .then((res) => {
                            console.log("helloyy")
                            console.log("kya lafda hain iska")
                            //generate(res);
                            setSlideData(res);
                        })
                }
            }
        });
    }, [sectionSlide, currentSlide])

    function generate() {
        if (slideData && slideData.shapes) {
            fullSize.push(slideData["slide-display"]["dimensions-x"]);
            fullSize.push(slideData["slide-display"]["dimensions-y"]);
            slideData.shapes.map(shape => {
                if (shape.shape_type === "TEXT") {
                    var shapeText = "";
                    shapesLocation.push(shape.location);
                    shapesSize.push(shape.size);
                    shape.shape_data.paragraphs.map(para => {
                        if (para !== []) {
                            para.runs.map(parText => {
                                shapeText += parText.text;
                            })
                        }
                    })
                    shapesText.push(shapeText);
                }
            })
            console.log("Went to generate");
            return ratioCalculation();
        }

    }

    function ratioCalculation() {
        //used to figure out locations of textboxes and thus text
        var x_dim = fullSize[0];
        var y_dim = fullSize[1];
        var left; //from the left edge of screen
        var top; //from the top edge
        var width; //length of a rectangle
        var height; //width of a rectangle
        for (let i = 0; i < shapesLocation.length; i++) {
            width = (shapesSize[i][0] / x_dim) * figma_x;
            height = (shapesSize[i][1] / y_dim) * figma_y;
            left = (shapesLocation[i][0] / x_dim) * figma_x;
            top = (shapesLocation[i][1] / y_dim) * figma_y;
            dimensions[i] = [width, height, left, top];
            indices.push(i);
        }
    }

    //Helper function to convert Inches and Pt (font) to Emu (the standard measurement of OpenXML)
    function EmuToPixel() {
        //Usage: 12 Inches --> INCHES(12), 40 pt = PT(40);
        //INCHES = lambda inches: int(inches * 914400);
        //PT = lambda p: int(p * 12700);
    }

    generate();
    //804 x 452: figma design slide
    const numSlides = new Array(slideLength);

    return (
        <>
            <div style={{ position: "relative", width: "94px", height: "94px", left: "36px", top: "25px" }}>
                <Logo></Logo>
            </div>
            <div>
                <Box sx={{ position: "absolute", width: figma_x + "px", height: figma_y + "px", left: "379px", top: "211px" }} border="1px solid #D7D7D7" background="#FFFFFF" boxShadow="-1px -1px 4px rgba(0, 0, 0, 0.1)" boxSizing="border-box">
                    {indices.map(index =>
                        //console.log("Check");
                        <Box key={index} id="outlined-basic" border="1px solid" sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", height: dimensions[index][1].toString() + "px", left: dimensions[index][2].toString() + "px", top: dimensions[index][3].toString() + "px", width: dimensions[index][0].toString() + "px" }}>
                            <Typography fontSize="11px" font="Inter" align="center">{shapesText[index]}</Typography>
                        </Box>
                    )}
                    {/*<Typography sx={{ lineHeight: dimensions[index][1].toString() + "px", left: dimensions[index][2].toString() + "px", position: "absolute", top: dimensions[index][3].toString() + "px", width: dimensions[index][0].toString() + "px" }}>{shapesText[index]}</Typography>*/}
                </Box>

            </div >


            {numSlides.map(slide => {
                <div style={{ position: "absolute", top: "195px", left: "10px", width: "120px", height: "96px" }}>
                    <Box border="1px solid" sx={{ p: 2 }}>
                        hello
                    </Box>
                </div>
            })
            }

            <div style={{ position: "absolute", width: "118px", height: "48px", left: "1280px", top: "32px" }}>
                <Button font="Inter">
                    Play
                </Button>
            </div>
        </>
    );
}

export default EditPresentationPage;
