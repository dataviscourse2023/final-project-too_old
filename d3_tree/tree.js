// todo:    fetch tree depth and compute fixed-depth (d.depth * X )
//          figure out undeclared variable issue in strict mode
//          color link

// example taken from https://www.dataviscourse.net/tutorials/lectures/lecture-d3-layouts/

// Script globals
const CHART_HEIGHT = 600
const CHART_WIDTH = 1000
const DIV_ID = "#tree-div"
const TOOLBOX_ID = "#tree-toolbox"
const NODE_DISTANCE = 160
const CIRCLE_RADIUS = 30
const DATA_FOLDER = "./d3_tree/"
const IMAGE_FOLDER = "./d3_tree/images/"


// Declare initial objects
let treeData = await d3.json(DATA_FOLDER + "data.json");

// Set the dimensions and margins of the diagram
let margin  = {top: 10, right: 90, bottom: 10, left: 90};
let width   = CHART_WIDTH - margin.left - margin.right;
let height  = CHART_HEIGHT - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
let svg = d3.select(DIV_ID).append("svg")
    .style("width", width + margin.right + margin.left + "px")
    .style("height", height + margin.top + margin.bottom + "px")
    .append("g")
    .attr("transform", "translate("
            + margin.left + "," + margin.top + ")");

let i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
let treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, d => d.children);

//We use x0 and y0 to keep track of the parent's position. We will use it to animate the children. 
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
root.children.forEach(collapse);

// Call recursive update function to handle creation and removal of nodes
update(root);

// Collapse the node and all it's children
//Here we create a _children attribute to hide the 'hidden' children. 
function collapse(d) {
    if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
    }
}

function update(source) {

    // Assigns the x and y position for the nodes
    let treeData = treemap(root);

    // Compute the new tree layout.
    let nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function(d){ d.y = d.depth * NODE_DISTANCE});

    // ****************** Nodes section ***************************

    // Update the nodes...
    let node = svg.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    // Enter any new modes at the parent's previous position.
    let nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", d => {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", d => d._children ? "lightsteelblue" : "#fff");

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("transform", "translate(" + 0 + "," + (CIRCLE_RADIUS + 10) + ")" )
        .attr("text-anchor", "middle")
        .text(d => d.data.name);

    // Add Picture for the nodes
    // (see https://stackoverflow.com/questions/31203720/how-to-place-an-image-in-d3-node)
    nodeEnter.append('defs')
        .append('pattern')
        .attr('id', function(d){ return 'pic_' + d.data.image; })
        .attr('height',CIRCLE_RADIUS*2)
        .attr('width',CIRCLE_RADIUS*2)
        .append('image')
            .attr('xlink:href',function(d,i){ return IMAGE_FOLDER + d.data.image; })
            .attr('height',CIRCLE_RADIUS*2)
            .attr('width',CIRCLE_RADIUS*2)

    // UPDATE
    let nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', CIRCLE_RADIUS)
        .style("fill", function(d){ return 'url(#pic_' + d.data.image +')'; })
        .attr('cursor', 'pointer');

    // Add mouseover handler
    nodeUpdate.on("mouseover", function(event, d){
            // Fetch node image and prepare the image+description html elements
            let imgSrc = "'"+ IMAGE_FOLDER + d.data.image + "'";
            let toolboxHTML = 
                "<div style='width:240px;height:160px;position:relative;overflow:hidden;'>"+
                "<img src="+imgSrc+" style='position:absolute;top:0;right:0;bottom:0;left:0;margin:auto;width:100%;' />"+
                "</div>" +
                "<span><br>"+d.data.description+"</span>";
            
            // Footnote boilerplate language
            let footnoteHide = "<span><br><br>Click again on <b>" + d.data.name + "</b> to hide subsequent events.</span>"
            let footnoteReveal = "<span><br><br>Click on <b>" + d.data.name + "</b> to see what can happen!</span>"

            // Update the toolbox html elements
            // Add footnotes based on the node child status
            let toolboxContents;
            if (d.children) {
                    toolboxContents = toolboxHTML + footnoteHide
                } else if (d._children) {
                    toolboxContents = toolboxHTML + footnoteReveal
                } else {
                    toolboxContents = toolboxHTML //case where we are at a leaf node
                }
            d3.select(TOOLBOX_ID).html(toolboxContents);
        })

    // Remove any exiting nodes
    let nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    let link = svg.selectAll('path.link')
        .data(links, d => d.id);

    // Enter any new links at the parent's previous position.
    let linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', d => {
            let o = {x: source.x0, y: source.y0}
            return diagonal(o, o)
        });

    // UPDATE
    let linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', d => diagonal(d, d.parent));

    // Remove any exiting links
    let linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', d => {
            let o = {x: source.x, y: source.y}
            return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        let path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`
        return path
    }

    // Toggle children on click.
    function click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            } else {
            d.children = d._children;
            d._children = null;
            }
        update(d);
    }
}