// Script globals
const CHART_HEIGHT = 600
const CHART_WIDTH = 1300
const DIV_ID = "#hr-div"
const TOOLBOX_ID = "#hr-toolbox"
const TOOLTIP_ID = "#tooltip"
const sourceFile = "./data/isochrones.csv"

// call init on load
init();

/**
 * Initialize chart svg, listeners, and fetch data
 */
function init () {
  //set up initial chart spaces
  let hrScatterPlot = d3.select("#hr-div").append("svg")
    .style("width", CHART_WIDTH + "px")
    .style("height", CHART_HEIGHT + "px")
    .attr("class","scatter-plot")
    .attr("id", "hr")

  for(let chart of [hrScatterPlot]){
    chart.append("g").attr("class", "xAxis")
    chart.append("g").attr("class", "yAxis")
  }

  // Add container for the data (z-axis / age) slider
  let slideContainer = d3.select("#hr-div").append("div")
    .attr("class","slideContainer")
    .attr("id","hrSlideContainer")
  slideContainer.append("label").attr("for","slider")

  //set up event listeners
  //call loadData to update data
  loadData(sourceFile);
}

/**
 * Fetch the data according to document settings
 * Then call update(data) to render the chart
 */
function loadData (source) {
  d3.csv(source)
    .then(dataOutput => {
      /*data wrangling*/
      const data = dataOutput.map((d) => ({
        Age: parseFloat(d.Age),
        mass: parseFloat(d.Mass),
        logL: parseFloat(d.logL),
        logTe: parseFloat(d.logTe),
        // Gmag: parseFloat(d.Gmag)
      }));
        // console.log(data)
        update(data);
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 * Render the visualizations
 * @param data
 */
function update (data) {
  updateScatterPlot(data, d3.select("#hr"), d3.select("#hrSlideContainer"));
}


/**
 * update the scatter plot.
 */
function updateScatterPlot (data, svg, slideContainer) {
  // Declare which columns we will be using for x and y columns
  const xColumn = "logTe" 
  const yColumn = "logL" 
  const zColumn = "Age"

  // Declare the chart dimensions and margins.
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const marginTop = 60;
  const marginRight = 30;
  const marginBottom = 60;
  const marginLeft = 90;

  // Declare the x (horizontal position) scale.
  // NOTE: SCALE IS BACKWARDS FOR TEMPERATURE
  let xbuffer = 0.1;
  //let xThreshold = 30000;
  let xMin = d3.min(data, (d) => d[xColumn]);
  let xMax = d3.max(data, (d) => d[xColumn]);
  console.log(xMax)
  console.log(xMin)
  
  // Check if xMax exceeds the maximum threshold
  //if (xMax > xThreshold) {
   // xMax = xThreshold; // Set xMax to the maximum threshold value
  //}

  let xDomain = new Array();
  if(xColumn === "logTe"){
      xDomain.push(xMax + xbuffer, xMin - xbuffer)
    }else{
      xDomain.push(xMin - xbuffer, xMax + xbuffer)
    };
  // print check
  console.log(xDomain);
  console.log(xMax)
  console.log(xMin)

  // need color gradient to correspond to luminosity on x-axis
  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([marginLeft, width - marginRight])
    //.interpolator(d3.interpolateRdYlBu);
    //svg.selectAll(".xColumn").data(data).enter().append("circle").attr("cx", function(d,i){return 30 + i*60}).attr("cy", 150).attr("r", 19).attr("fill", function(d){return myColor(d) })


    //.clamp(true); // Add clamping to restrict values to the domain
    
  
  // Declare the y (vertical position) scale.
  let ybuffer = 2;
  const y = d3.scaleLinear()
    .domain([d3.min(data, (d) => d[yColumn]) - ybuffer, d3.max(data, (d) => d[yColumn]) + ybuffer])
    .range([height - marginBottom, marginTop])

  const yTicks = y.ticks()
    .filter(tick => Number.isInteger(tick))

  // Declare the z (age) scale for dot colors
  //const z = d3.scaleLinear()
     //.domain(d3.extent(data, (d) => d[zColumn]))
  //   .range(['blue','red'])
     //.clamp(true)
  // color gradient working on age -- incorrect 
  const z = d3.scaleSequentialQuantile(d3.interpolateRdYlBu)
    .domain(d3.extent(data, (d) => d[zColumn]))
    .domain(Float32Array.from(data, (d) => d[zColumn]), d3.randomNormal(0.5, 0.15))
    //.interpolator(d3.interpolateReds)

  var myColor = d3.scaleSequential().domain([x(xMax), x(xMin)])
  .interpolator(d3.interpolateRgbBasis(["#9fbfff", "White", "#ff3800"]));

  svg.selectAll(".xColumn").data(data).enter().append("circle")
    .attr("cx", function(d,i){return 30 + i*60;})
    .attr("cy", 150).attr("r", 19)


  // Create the z(age) slider for filtering data  
  let uniqueAges = [...new Set(data.map(item => item.Age))];
  let slider = slideContainer.append("input")
    .attr("id", "slider")  
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", uniqueAges.length -1 )
    .attr("value", 0)

  // Use the z(age) slider to filter data
  let sliderInput = document.getElementById('slider');
  sliderInput.oninput = function(){
      let filteredAge = uniqueAges[this.value]
      slideContainer.selectAll("label").html(
          "Star Cluster Age: <br>"+numberFormatToString(filteredAge) + " years"
        );

        updateScatterPlotDots (data.filter( d => d.Age === filteredAge), svg, x, y, z, xColumn, yColumn, zColumn, myColor)
        sliderInput.style.setProperty('background', z(filteredAge))
    }
  sliderInput.oninput();

  // colors palette
var myCols = ["#ff3800","#ff5300","#ff6500","#ff7300","#ff7e00","#ff8912","#ff932c","#ff9d3f","#ffa54f","#ffad5e","#ffb46b","#ffbb78","#ffc184","#ffc78f","#ffcc99","#ffd1a3","#ffd5ad","#ffd9b6","#ffddbe","#ffe1c6","#ffe4ce","#ffe8d5","#ffebdc","#ffeee3","#fff0e9","#fff3ef","#fff5f5","#fff8fb","#fef9ff","#f9f6ff","#f5f3ff","#f0f1ff","#edefff","#e9edff","#e6ebff","#e3e9ff","#e0e7ff","#dde6ff","#dae4ff","#d8e3ff","#d6e1ff","#d3e0ff","#d1dfff","#cfddff","#cedcff","#ccdbff","#cadaff","#c9d9ff","#c7d8ff","#c6d8ff","#c4d7ff","#c3d6ff","#c2d5ff","#c1d4ff","#c0d4ff","#bfd3ff","#bed2ff","#bdd2ff","#bcd1ff","#bbd1ff","#bad0ff","#b9d0ff","#b8cfff","#b7cfff","#b7ceff","#b6ceff","#b5cdff","#b5cdff","#b4ccff","#b3ccff","#b3ccff","#b2cbff","#b2cbff","#b1caff","#b1caff","#b0caff","#afc9ff","#afc9ff","#afc9ff","#aec9ff","#aec8ff","#adc8ff","#adc8ff","#acc7ff","#acc7ff","#acc7ff","#abc7ff","#abc6ff","#aac6ff","#aac6ff","#aac6ff","#a9c6ff","#a9c5ff","#a9c5ff","#a9c5ff","#a8c5ff","#a8c5ff","#a8c4ff","#a7c4ff","#a7c4ff","#a7c4ff","#a7c4ff","#a6c3ff","#a6c3ff","#a6c3ff","#a6c3ff","#a5c3ff","#a5c3ff","#a5c3ff","#a5c2ff","#a4c2ff","#a4c2ff","#a4c2ff","#a4c2ff","#a4c2ff","#a3c2ff","#a3c1ff","#a3c1ff","#a3c1ff","#a3c1ff","#a3c1ff","#a2c1ff","#a2c1ff","#a2c1ff","#a2c1ff","#a2c0ff","#a2c0ff","#a1c0ff","#a1c0ff","#a1c0ff","#a1c0ff","#a1c0ff","#a1c0ff","#a1c0ff","#a0c0ff","#a0bfff","#a0bfff","#a0bfff","#a0bfff","#a0bfff","#a0bfff","#a0bfff","#9fbfff","#9fbfff","#9fbfff"];


  // ****************** Axes section ***************************

  // Update the X Axis
  var xAxis = svg.selectAll("g.xAxis")
    .transition()
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

  // Update the Y Axis
  var yAxis = svg.selectAll("g.yAxis")
    .transition()
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y)
        .tickValues(yTicks)
        // .tickFormat(d => `${10** d}`)
        )

  // Add the X Axis label
  var xAxisLabel = svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - marginBottom / 2 + 10)
      .text("log(Temperature(Kelvin))");

  // Add the Y Axis Label
  var yAxisLabel = svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", - height / 2)
    .attr("y", marginTop - 10)
    .attr("transform", "rotate(-90)")
    .text("Luminosity (ergs)");


  // Add the temperature legend
  var temperatureLegend = svg.append("g")
  .attr("class", "temperature legend")

  temperatureLegend.append("text")
  .attr("text-anchor", "left")
  .attr("x",  width / 11)
  .attr("y", height - marginBottom / 2 + 10)
  .html("&larr; increasing temperature")
  .style("font-size", "0.8vw");

  temperatureLegend.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width - marginLeft)
  .attr("y", height - marginBottom / 2 + 10)
  .html("decreasing temperature &rarr;")
  .style("font-size", "0.8vw");


  // Add the color legend
var legendStuff = svg.append("g").append("defs")
.append("linearGradient")
.attr("id","colorLegend")
.attr("x1","0%")
.attr("x2","50%")
.attr("y1","0%")
.attr("y2","0%");

var colorLegend = svg.append("rect")
.attr("class","color legend")
.attr("stroke","white")
.attr("stroke-width","2")
.attr("fill","url(#colorLegend)")
.attr("x", marginLeft)
.attr("y", marginBottom * 8.75)
.attr("width", width * 0.905)
.attr("height", 13);

d3.select('#colorLegend').append('stop')
.attr('offset', '0%')
.style('stop-color', myCols[myCols.length-1] )
.style('stop-opacity', 1);

d3.select('#colorLegend').append('stop')
.attr('offset', ((xMax) - Math.log10(29800))/((xMax)-(xMin))*100 + '%') //color corresponding to 20000K
.style('stop-color', myCols[myCols.length-1])
.style('stop-opacity', 1);

d3.select('#colorLegend').append('stop')
.attr('offset', ((xMax)-Math.log10(6400))/((xMax)-(xMin))*100 + '%') //color corresponding to 6000K (almost white)
.style('stop-color', "#fff8fb" )
.style('stop-opacity', 1);

d3.select('#colorLegend').append('stop')
.attr('offset', '100%')
.style('stop-color', myCols[3]) //color corresponding to 1500K
.style('stop-opacity', 1);

  
}

function updateScatterPlotDots(data, svg, x, y, z, xColumn, yColumn, zColumn, colorMapperfnc) {
  // ****************** Dots section ***************************

  // add dots
  let dots = svg.selectAll("circle")
    .data(data);

  // ENTER dots
  let dotsEnter = dots.enter().append("circle")
    .attr("cx", (d) => x(d[xColumn]))
    .attr("cy", (d) => y(d[yColumn]))
    .attr("r", 2)
    .attr("fill", d => z(d[zColumn]))
    .attr("class", "datapoint"); // Adding a class for easier selection


  // Add mouseover and onclick events
  dotsEnter.on('mouseover', function (event, d) {
      d3.select(this).transition()
        .duration('50')
        .attr("class", "hovered")
        .attr('opacity', '.85');

      // Calculate the position of the tooltip relative to the data point
      const tooltipX = event.pageX + 7; // Adjust these values for proper positioning
      const tooltipY = event.pageY - 7; // Adjust these values for proper positioning

      // Create and position a div for the tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("left", tooltipX + "px")
        .style("top", tooltipY + "px")
        .style("transform", `translate(${10}px, ${-10}px)`)
        .html(
          "Hi! I am a star! Here are some of my current properties: <br><br>" +
          "Age: " + numberFormatToString(d.Age) + " years <br><br>" +
          "Mass: " + d.mass + "<br><br>" +
          "Temperature: " + d.logTe + "<br><br>" +
          "Luminosity: " + d.logL + "<br><br>"
        );

      // Removing the tooltip on mouseout
      d3.select(this).on('mouseout', function () {
        d3.select(this).transition()
          .duration('50')
          .attr("class", "datapoint")
          .attr('opacity', '1');
        tooltip.remove();
      });
      
      //  d3.select(TOOLBOX_ID).html(
       // "Age: "         + numberFormatToString(d.Age) + " years <br><br>" +
        //"Mass: "        + d.mass + "<br><br>" +
       // "Temperature: " + d.logTe + "<br><br>" +
        //"Luminosity: "  + d.logL + "<br><br>"
       // );
    });
    //.on('mouseout', function (d, i) {
      //d3.select(this).transition()
        //.duration('50')
        //.attr("class", "datapoint")
        //.attr("class", null)
        //.attr('opacity', '1');
      //d3.select(TOOLBOX_ID)
        //.html("Hover your mouse over a star to see its stellar properties");
      //tooltip.remove(); 
    //})

  dotsEnter.on("click", function(event, d){
    console.log("x: " + d[xColumn] + ", y: " + d[yColumn])
    })

  // MERGE dots
  let dotsMerge = dotsEnter.merge(dots) 
    .attr("cx", (d) => x(d[xColumn]))
    .attr("cy", (d) => y(d[yColumn]))
    .attr("r", 2)
    .attr("fill", d => colorMapperfnc(x(d[xColumn])))

  // EXIT dots
  let dotsExit = dots.exit()
    .remove(); 
}

// Helper function to convert number formatting
// https://stackoverflow.com/questions/36734201/how-to-convert-numbers-to-million-in-javascript
function numberFormatToString(labelValue) {

  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e+9

  ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + " billion"
  // Six Zeroes for Millions 
  : Math.abs(Number(labelValue)) >= 1.0e+6

  ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + " million"
  // Three Zeroes for Thousands
  : Math.abs(Number(labelValue)) >= 1.0e+3

  ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + " thousand"

  : Math.abs(Number(labelValue));

}