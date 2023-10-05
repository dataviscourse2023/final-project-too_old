import * as fetch from "./../data/fetch.js"
export {setup};

// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DUATION = 300;

function setup () {
  //set up initial chart spaces
  let scatterPlot = d3.select("#button_result").append("svg").attr("class","scatter-plot");

  for(chart of [scatterPlot]){
    chart.append("g").attr("class", "xAxis")
    chart.append("g").attr("class", "yAxis")
  }

  //call changeData to update data
  changeData();
}

/**
 * Update the data according to document settings
 */
function changeData () {
  let data = fetch.fetchJSONFile(file, fetch.readData);
  update(data);
}

/**
 * Render the visualizations
 * @param data
 */
function update (data) {
  console.log(data)
  // updateScatterPlot(data, d3.select("svg.scatter-plot"));
}


/**
 * update the scatter plot.
 */
function updateScatterPlot (data, svg) {
 
  // Declare the chart dimensions and margins.
  const width = 500;
  const height = 250;
  const marginTop = 30;
  const marginRight = 30;
  const marginBottom = 30;
  const marginLeft = 60;

  // Declare the x (horizontal position) scale.
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.cases)])  
    .range([marginLeft, width - marginRight])
  
  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.deaths)])
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
      .attr("cx", (d) => x(d.cases))
      .attr("cy", (d) => y(d.deaths))
      .attr("r", 5);

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
    console.log("Cases: " + d.cases + ", Deaths: " + d.deaths)
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