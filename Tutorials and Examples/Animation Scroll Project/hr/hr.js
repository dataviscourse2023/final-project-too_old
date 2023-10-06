export {init};

console.log("here is hr.js")

function init () {
  //set up initial chart spaces
  let hrScatterPlot = d3.select("#hr-div").append("svg").attr("class","scatter-plot").attr("id", "hr");
  let oneScatterPlot = d3.select("#hr-div2").append("svg").attr("class","scatter-plot").attr("id", "hr2");

  for(let chart of [hrScatterPlot, oneScatterPlot]){
    chart.append("g").attr("class", "xAxis")
    chart.append("g").attr("class", "yAxis")
  }


  //set up event listeners
  //call loadData to update data
  loadData();
}

/**
 * Update the data according to document settings
 */
function loadData (source = "hr/data/covid_ca.csv") {
  d3.csv(source)
    .then(dataOutput => {
      /*data wrangling*/
      const data = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
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
  updateScatterPlot(data, d3.select("#hr2"));
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
      .attr("r", 3);

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