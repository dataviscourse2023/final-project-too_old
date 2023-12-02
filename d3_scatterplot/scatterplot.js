// Script globals
const CHART_HEIGHT = 600
const CHART_WIDTH = 1300
const DIV_ID = "#scatterplot-div"
const TOOLBOX_ID = "#scatterplot-toolbox"
const TOOLTIP_ID = "#tooltip"
const sourceFile = "./data/isochrones.csv"

// call init on load
init();

/**
 * Initialize chart svg, listeners, and fetch data
 */
function init () {
  //set up initial chart spaces
  let ScatterPlot = d3.select(DIV_ID).append("svg")
    .style("width", CHART_WIDTH + "px")
    .style("height", CHART_HEIGHT + "px")
    .attr("class","scatter-plot")
    .attr("id", "scatterplot")

  for(let chart of [ScatterPlot]){
    chart.append("g").attr("class", "xAxis")
    chart.append("g").attr("class", "yAxis")
    chart.append("text").attr("class", "xAxisLabel")
    chart.append("text").attr("class", "yAxisLabel")
  }

  //call loadData to initialize the dropdown boxes, then update data and initialize visualization
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
        logg: parseFloat(d.logg),
        Mloss: parseFloat(d.Mloss),
      }));
        // console.log(data)
        update(data);
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}


/**
 * Add dropdown choices and render the visualizations
 * @param data
 */
function update (data) {
    // attach dropdowns
    let dropdownContainer = d3.select("#scatterplot-div").append("div")
        .attr("class","dropdownContainer")
        .attr("id","scatterplotDropdownContainer")
    dropdownContainer.append("label")
        .attr("class","dropdownLabel")
        .html("x-axis: ")
    let xMetric = dropdownContainer.append("select")
        .attr("class","dropdownSelector")
        .attr("id","xMetric")
    dropdownContainer.append("label")
        .attr("class","dropdownLabel")
        .html("y-axis: ")
    let yMetric = dropdownContainer.append("select")
        .attr("class","dropdownSelector")
        .attr("id","yMetric")
    
    // attach dropdown choices
    var metrics = {
        Age: "Age (billions of years)",
        mass: "Mass (Solar Masses)",
        logL: "Luminosity (Solar Luminosity)",
        logTe: "Temperature (log(T))",
        logg: "Gravity (dex)",
        Mloss: "Mass Lost (Solar Masses)",
      };
    for(let metric of [xMetric, yMetric]){
        for(let key in metrics){
            metric.append("option")
            .attr("value",key)
            .html(metrics[key])
        }
    }

    // attach event listeners
    for(let source of ["xMetric", "yMetric"]){
      document.getElementById(source).onchange = function () {
        updateScatterPlot(data, d3.select("#scatterplot"), document.getElementById("xMetric").value, document.getElementById("yMetric").value, metrics)
      };  
    }

    //call initial update
    updateScatterPlot(data, d3.select("#scatterplot"), document.getElementById("xMetric").value, document.getElementById("yMetric").value, metrics);
}
function random_elements(data)
{
  
return data[Math.floor(Math.random()*data.length)];
     
}
console.log(random_elements(data));


/**
 * update the scatter plot.
 */

function updateScatterPlot (data, svg, xColumn, yColumn, metrics) {
  // Declare the chart dimensions and margins.
  const width = CHART_WIDTH;
  const height = CHART_HEIGHT;
  const marginTop = 60;
  const marginRight = 30;
  const marginBottom = 60;
  const marginLeft = 90;

  // Declare the x (horizontal position) scale.
  // NOTE: SCALE IS BACKWARDS FOR TEMPERATURE
  let xbuffer = 0.0;
  let xMin = d3.min(data, (d) => d[xColumn]);1
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
  let ybuffer = 0;
  const y = d3.scaleLinear()
    .domain([d3.min(data, (d) => d[yColumn]) - ybuffer, d3.max(data, (d) => d[yColumn]) + ybuffer])
    .range([height - marginBottom, marginTop])

  const yTicks = y.ticks()
    .filter(tick => Number.isInteger(tick))



  

  // ****************** Dots section ***************************

  // add dots
  let dots = svg.selectAll("circle")
    .data(data);

  // ENTER dots
  let dotsEnter = dots.enter().append("circle")
    .attr("cx", (d) => x(d[xColumn]))
    .attr("cy", (d) => y(d[yColumn]))
    .attr("r", 2)

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
          "Mass: " + d.mass + " solar masses" + "<br><br>" + 
          "Temperature: " + d.logTe + "<br><br>" +
          "Luminosity: " + d.logL + " ergs" + "<br><br>" + 
          "Gravity: " + d.logg + " dex"
        );
        
        // Removing the tooltip on mouseout
      d3.select(this).on('mouseout', function () {
        d3.select(this).transition()
          .duration('50')
          .attr("class", "datapoint")
          .attr('opacity', '1');
        tooltip.remove();
      });


    })
    
   

  dotsEnter.on("click", function(event, d){
    console.log("x: " + d[xColumn] + ", y: " + d[yColumn])
    })

  // MERGE dots
  let dotsMerge = dotsEnter.merge(dots) 
    .attr("cx", (d) => x(d[xColumn]))
    .attr("cy", (d) => y(d[yColumn]))
    .attr("r", 2)

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

  // Format axis when Age is chosen
  let formatValue = d3.format(".2s");
  if(xColumn === "Age"){xAxis.call(d3.axisBottom(x).tickFormat(function(d) { return formatValue(d).replace(/G/, " b")}));}
  if(yColumn === "Age"){yAxis.call(d3.axisLeft(y).tickFormat(function(d) { return formatValue(d).replace(/G/, " b")}));}

  svg.selectAll(".xAxisLabel")
    .remove(); // Remove existing labels to update them
  // Update the X Axis label with tooltip functionality
  svg.append("text")
    .attr("class", "xAxisLabel")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height - marginBottom / 2 + 10)
    .text(metrics[xColumn])
    .on("mouseover", function() {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Explanation for X-axis: " + metrics[xColumn])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });
  // Update the Y Axis label with tooltip functionality
  var yAxisLabel = svg.selectAll(".yAxisLabel")
    .attr("text-anchor", "middle")
    .attr("x", - height / 2)
    .attr("y", marginTop - 20)
    .attr("transform", "rotate(-90)")
    .text(metrics[yColumn])
    .on("mouseover", function() {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Explanation for Y-axis: " + metrics[yColumn])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });
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
