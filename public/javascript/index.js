function queryAndDraw() {
// Get JSON data
//console.log("http://localhost:5000/query/" + theForm.queryStr.value);

console.log($("input#searchBar").val());
//console.log(document.getElementById('input#searchBar').value);
treeJSON = d3.json("http://localhost:5000/query/" + $("input#searchBar").val(), function(error, treeData) {
    d3.select('svg').remove();
    
    // Calculate total nodes, max label length
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;
    var nodes;
    var links;

    var nodeCircleRadius = 7.5;
    var pieOuterRadius = nodeCircleRadius + 20;
    var increaseRadius = 20;

    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.y, d.x];
        });

    // A recursive helper function for performing some setup by walking through all nodes

    var distanceScaleFactor = 30;

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                children[i].accumDis = children[i].distance * distanceScaleFactor + parent.accumDis;
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    treeData.accumDis = 0;
    // Call visit function to establish maxLabelLength
    visit(treeData, 
          function(d) {
            totalNodes++;
            maxLabelLength = Math.max(d.name.length, maxLabelLength);

          }, 
          function(d) { 
            return d.children && d.children.length > 0 ? d.children : null;
          }
    );

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    var dragStarted = false;
    var featuresList = null;
    var draggingNodeText;
    // Define the drag listeners for drag/drop behaviour of nodes.
    //var circleCenter;
    var selectedFeatureId = -1;
    var dragListenerForNodes = d3.behavior.drag()
        .on("dragstart", function(d) {
            dragStarted = true;
            //nodes = tree.nodes(d);
            
            //console.log(this);
            //console.log(d3.select(d).attr("cx") + ' ' + d3.select(d).attr("cy"));
            //console.log(d.x + ' ' + d.y);
            //var coordinates = d3.mouse(this);
            //console.log(coordinates[0] + ' ' + coordinates[1]);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. 
            //Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            selectedFeatureId = -1;
        })
        .on("drag", function(d) {
            //console.log(d.x + ' ' + d.y);
            if(featuresList === null) { //maybe there is a better solution
                featuresList = svgGroup.selectAll("g.arc")
                                   .data(featureNamesPieData)
                                   .enter()
                                   .append("g")
                                   .attr("class", "arc")
                                   .attr("transform", "translate(" + d.y + "," + d.x + ")");
                featuresList.on('mouseover',function(node) {
                                
                                //console.log("over");
                                selectedFeatureId = node.data.id;
                                
                                })
                            .on('mouseout',function(node) {
                                
                                //console.log("out");
                                if(selectedFeatureId === node.data.id) {
                                    selectedFeatureId = -1;
                                }
                                
                                });                
                
                draggingNodeText = svgGroup.selectAll(".nodeText").filter( //can be optimized
                    function (nodeTextTag,i) {
                        if(nodeTextTag.name === d.name) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                );
                draggingNodeText.text("");
                
                //draw arc shapes
                featuresList.append("path")
                            .attr("d", arc)
                            .style("fill", function(d) { return color(d.data.name); });
                            
                            

                //draw text on donut chart
                featuresList.append("text")
                            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; }) //font-position
                            .attr("dy", "0.35em")
                            .style("font-size","8px")
                            .style("text-anchor", "middle")
                            .text(function(d) { return d.data.name; });
            }
        })
        .on("dragend", function(d) {
            if(featuresList !== null) {
                dragStarted = false;
                featuresList.remove();
                draggingNodeText.text(d.name);
            }
            if(selectedFeatureId !== -1) {
                
                //do selected operations

            }
            featuresList = null;
        });

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {

        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0,
                    y: selectedNode.x0
                },
                target: {
                    x: draggingNode.y0,
                    y: draggingNode.x0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren(d) {
        if(d === root) {
            return d;
        }
        //console.log("test");
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        /*
        if (d.name === "assume") {
            console.log("yes");
            d3.json("exJSON/graphTUI.json",function (err,data) {
                d.children = data.children;
                console.log(data.children);
                update(d);
                centerNode(d);

            }); 
        }
        */
        //console.log(d);

        return d;
    }

    // Toggle children on click.

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        var newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        tree = tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        nodes = tree.nodes(root).reverse();
        links = tree.links(nodes);

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
                       .data(nodes, function(d) {
                            return d.id || (d.id = ++i);
                       });

        
        nodes.forEach(function(d) {
            //console.log(d.y);
            //console.log(d.name);
            d.y = d.accumDis; 
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });
        

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click)
            .call(dragListenerForNodes);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", nodeCircleRadius)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener); //invoke this function onces manually

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");

    // Define the root(tree layout)
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    //console.log(root);

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);

    var color = d3.scale.ordinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var arc = d3.svg.arc() //function
        .outerRadius(pieOuterRadius)
        .innerRadius(nodeCircleRadius);

    var pie = d3.layout.pie() //function
                       .value(function(d) { return d.proportion; }); //proportion is used to divide area
                       
    
    var featureNamesPieData = null;

    
    d3.json("exJSON/features.json", function(error, data) {
        featureNamesPieData = pie(data);

    });
    
});

}