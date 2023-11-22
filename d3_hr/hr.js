// Script globals
const CHART_HEIGHT = 600
const CHART_WIDTH = 1100
const DIV_ID = "#hr-div"
const TOOLBOX_ID = "#hr-toolbox"
const sourceFile = "./d3_hr/isochrones.csv"

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
  console.log(hrScatterPlot);

  for(let chart of [hrScatterPlot]){
    chart.append("g").attr("class", "xAxis")
    chart.append("g").attr("class", "yAxis")
  }


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
        console.log(data)
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
  updateScatterPlot(data, d3.select("#hr"));
}


/**
 * update the scatter plot.
 */
function updateScatterPlot (data, svg) {
  // Declare which columns we will be using for x and y columns
  const xColumn = "logTe"
  const yColumn = "logL" 
  const zColumn = "Age"

  // Declare the chart dimensions and margins.
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const marginTop = 60;
  const marginRight = 30;
  const marginBottom = 45;
  const marginLeft = 90;

  // Declare the x (horizontal position) scale.
  //NOTE: SCALE IS BACKWARDS FOR TEMPERATURE
  let xbuffer = 0.1;
  let xMin = d3.min(data, (d) => d[xColumn]);
  let xMax = d3.max(data, (d) => d[xColumn]);
  let xDomain = new Array();
  if(xColumn === "logTe"){
      xDomain.push(xMax + xbuffer, xMin - xbuffer)
    }else{
      xDomain.push(xMin - xbuffer, xMax + xbuffer)
    };

  const x = d3.scaleLinear()
    .domain(xDomain)
    .range([marginLeft, width - marginRight])
  
  // Declare the y (vertical position) scale.
  let ybuffer = 2;
  const y = d3.scaleLinear()
    .domain([d3.min(data, (d) => d[yColumn]) - ybuffer, d3.max(data, (d) => d[yColumn]) + ybuffer])
    .range([height - marginBottom, marginTop])

  const yTicks = y.ticks()
    .filter(tick => Number.isInteger(tick))

  // Declare the z (dot color) scale.
  // const z = d3.scaleLinear()
  //   .domain(d3.extent(data, (d) => d[zColumn]))
  //   .range(['blue','red'])
  //   .clamp(true)
  const z = d3.scaleSequential()
    .domain(d3.extent(data, (d) => d[zColumn]))
    .interpolator(d3.interpolateReds)


  // ****************** Dots section ***************************

  // add dots
  let dots = svg.selectAll("circle")
    .data(data);

  // ENTER dots
  let dotsEnter = dots.enter().append("circle")
    .attr("fill", d => z(d[zColumn]))

  // Add mouseover and onclick events
  dotsEnter.on('mouseover', function (event, d) {
      d3.select(this).transition()
        .duration('50')
        .attr("class", "hovered")
        .attr('opacity', '.85');
      d3.select(TOOLBOX_ID).html(
        "Age: "         + numberFormatToString(d.Age) + " years <br><br>" +
        "Mass: "        + d.mass + "<br><br>" +
        "Temperature: " + d.logTe + "<br><br>" +
        "Luminosity: "  + d.logL + "<br><br>"
        );
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('50')
        .attr("class", null)
        .attr('opacity', '1');
      d3.select(TOOLBOX_ID)
        .html("Hover your mouse over a star to see its stellar properties"); 
    })

  dotsEnter.on("click", function(event, d){
    console.log("x: " + d[xColumn] + ", y: " + d[yColumn])
    })

  // MERGE dots
  let dotsMerge = dotsEnter.merge(dots) 
    .transition()
      .attr("cx", (d) => x(d[xColumn]))
      .attr("cy", (d) => y(d[yColumn]))
      .attr("r", 2);

  // EXIT dots
  let dotsExit = dots.exit()
    .remove(); 

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
      .call(d3.axisLeft(y).tickValues(yTicks))

  // Add the X Axis label
  var xAxisLabel = svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - marginBottom / 2 + 15)
      .text("Temperature (UNITS)");

  // Add the Y Axis Label
  var yAxisLabel = svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", - height / 2)
    .attr("y", marginTop - 10)
    .attr("transform", "rotate(-90)")
    .text("Luminosity (UNITS)");
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