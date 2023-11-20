// Script globals
const CHART_HEIGHT = 600
const CHART_WIDTH = 1000
const DIV_ID = "#hr-div"
const sourceFile = "./d3_hr/isochrone.csv"

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
 * Update the data according to document settings
 */
function loadData (source) {
  d3.csv(source)
    .then(dataOutput => {
      /*data wrangling*/
      const data = dataOutput.map((d) => ({
        logAge: parseInt(d.logAge), 
        mass: parseFloat(d.Mass),
        logL: parseFloat(d.logL),
        logTe: parseFloat(d.logTe),
        Gmag: parseFloat(d.Gmag)
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

  // Declare the chart dimensions and margins.
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const marginTop = 30;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 60;

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
  let ybuffer = 1;
  const y = d3.scaleLinear()
    .domain([d3.min(data, (d) => d[yColumn]) - ybuffer, d3.max(data, (d) => d[yColumn]) + ybuffer])
    .range([height - marginBottom, marginTop])

  const yTicks = y.ticks()
    .filter(tick => Number.isInteger(tick))

  //add dots
  var dots = svg.selectAll("circle")
    .data(data);

  //remove existing dots. This is needed if the dataset size changes
  dots.exit()
    .remove(); 
 
  //Add new dots and merge them
  dots.enter().append("circle")
    .merge(dots) 
    .transition()
      .attr("cx", (d) => x(d[xColumn]))
      .attr("cy", (d) => y(d[yColumn]))
      .attr("r", 2);

  //Add mouseover and onclick events. Why does this only work after changing the data?
  dots.on('mouseover', function (event, d) {
      d3.select(this).transition()
        .duration('50')
        .attr("class", "hovered")
        .attr('opacity', '.85');     
    })
    .on('mouseout', function (d, i) {
      d3.select(this).transition()
        .duration('50')
        .attr("class", null)
        .attr('opacity', '1');
    })

  dots.on("click", function(event, d){
    console.log("x: " + d[xColumn] + ", y: " + d[yColumn])
    })

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
}