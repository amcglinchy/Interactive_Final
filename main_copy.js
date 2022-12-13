/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * .7,
    height = window.innerHeight * .8,
    margin = { top: 20, bottom: 50, left: 40, right: 40 };
 let active = d3.select(null),geoPath, svg, svg2, nta, legend;

/**
* APPLICATION STATE
* */
let state = {
    geojson: [],
    hover: {
        Neigh: null,
        incarRate: null
    }
};

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
 d3.json("../reprojected_nta.geojson")
]).then(([geojson]) => {
 state.geojson = geojson;
//   console.log("state: ", state);
 init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {

    svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("click", null);

    svg2 = d3.select("#container2")
        .append("svg")
        .attr("width", width)
        .attr("height", 100);
    

    const projection = d3.geoAlbersUsa().fitSize([width,height], state.geojson);
    
    geoPath = d3.geoPath().projection(projection);

    let incarRate = state.geojson.features.map(d=>((d.properties.incar_pop_sum/d.properties.total_pop_sum_sum)*10000));
    
    for (let i = 0; i< incarRate.length; i++){
        if (incarRate[i] === null){
            incarRate[i] = 0
        }
        if (isNaN(incarRate[i])) incarRate[i] = 0;
    };

    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(incarRate)])
        .range(["#FFF7F7", "#E63B04"]);

        console.log(d3.max(incarRate));

    nta = svg.selectAll("nta")
        .data(state.geojson.features)
        .join("path")
        .attr("d", geoPath)
        .attr("class", "nta")
        .attr("stroke", "black")
        .style("stroke-width", ".2")
        .attr("fill", "transparent")
        .filter((d)=>(d.properties.total_pop_sum_sum>4000)) //taking out parks/cemetaries/islands
        .attr("fill",(d => colorScale((d.properties.incar_pop_sum/d.properties.total_pop_sum_sum)*10000)));
    


    
     legend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .title("Incarceration Rate per 10,000 Residents")
        .titleWidth(150)
        .orient("horizontal")
        .shapePadding(0)
        .shapeWidth(30)
        .scale(colorScale)
        .labels(["0", " ", " ", " ", "76.92"]);

 draw(); // calls the draw function
}      


/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {

//Mouse functions
   const mouseOver = function (d){
        d3.selectAll(".nta")
			.transition()
			.duration(300)
			.style("opacity", .5)
			.style("stroke", "black");
		d3.select(this)
			.transition()
			.duration(300)
			.style("opacity", 2)
			.style("stroke", "red");
            // .style("stroke-width", "1");
        tooltip.style("visibility", "visible");
    }

    const mouseMove = (event, d) =>{
        tooltip.style("top", (event.y)+10 + "px")
        .style("left", (event.x)+20 + "px")
        // .html(d.properties.NTAName +  "<br>" +"Incarcerated population: " + d.properties.incar_pop_sum)
        .html(d.properties.NTAName)
        .transition().duration(400)
		.style("opacity", 1);
    }

   const mouseOut = (e) =>{
        d3.selectAll(".nta")
			.transition()
			.duration(300)
			.style("opacity", 1)
			.style("stroke", "black");
        tooltip.transition().duration(300)
        .style("opacity", 0);
    }

// Tooltip
    const tooltip = d3.select("#container")
        .append("div")
        .attr("class", "tooltip");

// Add legend
    svg2.append("g")
        .attr("class", "leg")
        .attr("transform", "translate(700,20)")
        .style("font-size", "12px");

    svg2.select(".leg")
        .call(legend);

//InfoBox
    const infoBox = svg.selectAll("rect")
        .data(state.geojson.features)
        .enter()
        .append("rect")
        .attr("class", "infoBox")
        .style("visibility", "hidden")
        .attr('x', 20)
        .attr('y', 45)
        .attr('width', 300)
        .attr('height', 120)
        .attr('stroke', 'black');

//InfoBox texts
    const boxText0 = svg
        .append("text")
        .attr("class", "txt0")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 35);

    const boxText1 = svg
        .append("text")
        .attr("class", "txt1")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 60);
    
    const boxText2 = svg
        .append("text")
        .attr("class", "txt2")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 80);

    const boxText3 = svg
        .append("text")
        .attr("class", "txt3")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 100);

    const boxText4 = svg
        .append("text")
        .attr("class", "txt4")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 120);

    const boxText5 = svg
        .append("text")
        .attr("class", "txt5")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 140);

    const boxText6 = svg
        .append("text")
        .attr("class", "txt6")
        .style("visibility", "hidden")
        .attr('x', 30)
        .attr('y', 160);
        
// Zoom/Reset/Clicked
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    function reset() {
        active.classed("active", false);
        active = d3.select(null);
        nta.transition().style("fill", null);
        svg.transition().duration(750).call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
        infoBox
            .style("visibility", "hidden");
        boxText0
            .style("visibility", "hidden");
        boxText1
            .style("visibility", "hidden");
        boxText2
            .style("visibility", "hidden");
        boxText3
            .style("visibility", "hidden");
        boxText4
            .style("visibility", "hidden");
        boxText5
            .style("visibility", "hidden");
        boxText6
            .style("visibility", "hidden");
      }

    function clicked(event, d) {

        if (active.node() === this) return reset();
        active.classed("active", false);
        active = d3.select(this).classed("active", true);

        const [[x0, y0], [x1, y1]] = geoPath.bounds(d);
        event.stopPropagation();
        nta.transition().style("fill", null).style("opacity", null);
        d3.select(this).transition().style("fill", "black");
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
            d3.pointer(event, svg.node())
        );
        tooltip
            .style("visibility", "hidden");
        infoBox
            .style("visibility", "visible");
        boxText0
            .style("visibility", "visible")
            .text(`${d.properties.NTAName}`);
        boxText1
            .style("visibility", "visible")
            .text(`Total Population: ${d3.format(",")(d.properties.total_pop_sum_sum)}`);
        boxText2
            .style("visibility", "visible")
            .text(`Incarcerated Population: ${d.properties.incar_pop_sum}`);
        boxText3
            .style("visibility", "visible")
            .text(`Incarceration Rate*: ${((d.properties.incar_pop_sum/d.properties.total_pop_sum_sum)*10000).toFixed(2)}`);
        boxText4
            .style("visibility", "visible")
            .text(`Median Income: $${d3.format(",")(Math.round(d.properties.med_inc_mean))}`);
        boxText5
            .style("visibility", "visible")
            .text(`Poverty: ${d.properties.poverty_rate_mean.toFixed(2)}%`);
        boxText6
            .style("visibility", "visible")
            .text(`Housing Burden: ${d.properties.housing_burden_mean.toFixed(2)}%`);
            ;
    };
    
    function zoomed(event) {
        const {transform} = event;
        nta.attr("transform", transform);
        nta.attr("stroke-width", 1 / transform.k);
      }

    svg.call(zoom);

    nta
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut)
      .on("click", clicked)
      .filter((d)=> (d.properties.total_pop_sum_sum<4000))
    //   .attr("visibility", "hidden")
      .style("stroke", null);

}