(function() {

    var width = 1280,
        height = 800,
        root;

    var force = d3.layout.force()
        //.linkDistance(function(d){return (d.distance);})
        .charge(-250)
        .gravity(.01)
        .size([width, height])
        .on("tick", tick);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "graph-svg-component");

    var link = svg.selectAll(".link"),
        node = svg.selectAll(".node");

    d3.json("http://localhost:5000/query/plsa", function(error, json) {
      root = json;
      update();
    });

    function update() {
      var nodes = flatten(root),
          links = d3.layout.tree().links(nodes);
      // Restart the force layout.
      force
          .nodes(nodes)
          //.linkDistance(function(d){return (d.distance);})
          .linkDistance(function(d) { return d.target.distance*20; })
          .links(links)
          .start();

      // Update links.
      link = link.data(links, function(d) { return d.target.id; });

      link.exit().remove();

      link.enter().insert("line", ".node")
          .attr("class", "link");

      // Update nodes.
      node = node.data(nodes, function(d) { return d.id; });

      node.exit().remove();

      var nodeEnter = node.enter().append("g")
          //.attr("class", "node")
          .attr("class", function(d) { return "node type" + d.type })
          .on("click", click)
          .call(force.drag)
     
          
//          d3.selectAll(".type2").append("image")
//          .attr("xlink:href", function(d){return d.img_href})
//          .attr("opacity",.7)
//          .attr("x", -25)
//          .attr("y", -25)
//          .attr("width", 50)
//          .attr("height", 50)
//          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("x", -40)
//          .attr("y", -40).attr("width", 80).attr("opacity",1)
//          .attr("height", 80);
//  })
//          
//          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("x", -25)
//          .attr("y", -25).attr("width", 50).attr("opacity",.3)
//          .attr("height", 50);
//  });
          d3.selectAll(".type2").append("circle")
          .attr("r", function(d) { return 20; })
          
          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("r", 30)
  })
          
          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("r", 20);
  })
          .style("fill", color1);
          
          nodeEnter.append("text")
          .attr("dy", "2em")
          .text(function(d) { return d.name; });
          
          
          d3.selectAll(".type1").append("circle")
          .attr("r", function(d) { return 20; })
          
          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("r", 30)
  })
          
          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("r", 20);
  })
          .style("fill", color1);
          
          nodeEnter.append("text")
          .attr("dy", "2em")
          .text(function(d) { return d.name; });
      }
// paper with pics-------------------------------------------          
//          d3.selectAll(".type2").append("image")
//          .attr("xlink:href", function(d){return d.img_href})
//          .attr("opacity",.7)
//          .attr("x", -25)
//          .attr("y", -25)
//          .attr("width", 50)
//          .attr("height", 50)
//          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("x", -40)
//          .attr("y", -40).attr("width", 80).attr("opacity",1)
//          .attr("height", 80);
//  })
//          
//          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("x", -25)
//          .attr("y", -25).attr("width", 50).attr("opacity",.3)
//          .attr("height", 50);
//  }); 
// All circle-------------------------------------------
//          d3.selectAll(".type2").append("circle")
//          .attr("r", function(d) { return 20; })
//          
//          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("r", 30)
//  })
//          
//          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("r", 20);
//  })
//          .style("fill", color1);
//          
//          nodeEnter.append("text")
//          .attr("dy", "2em")
//          .text(function(d) { return d.name; });
//          
//          
//          d3.selectAll(".type1").append("circle")
//          .attr("r", function(d) { return 20; })
//          
//          .on('mouseover', function() { d3.select(this).transition().duration(200).attr("r", 30)
//  })
//          
//          .on('mouseout', function() { d3.select(this).transition().duration(500).attr("r", 20);
//  })
//          .style("fill", color1);
//          
//          nodeEnter.append("text")
//          .attr("dy", "2em")
//          .text(function(d) { return d.name; });
//      node.append("image")
//          .attr("xlink:href", function(d){return d.img_href})
//          .attr("x", -25)
//          .attr("y", -25)
//          .attr("width", 50)
//          .attr("height", 50);
          
//      node.select("circle")
//          //.attr("r", 20)
//          //.style("fill", color1);
//          .style("background", function(d){
//              if(d.type === 2){
//                  //console.log("url(#\""+d.img_href+"\")");
//                  return "url(#"+d.img_href+")";
//                   //return color1(d);
//              }
//              else{
//                  return color1(d);
//              }
//          });
    
    
    function tick() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    }

//    function color(d) {
//      return d._children ? "#3182bd" // collapsed package
//          : d.children ? "#c6dbef" // expanded package
//          : "#fd8d3c"; // leaf node
//    }
    function color1(d) {
      if(d.type === 1){
          return "rgb(98, 206, 176)" ;
      }
      else if(d.type === 2){
          return "#fd8d3c";
      }
      else{
          return "rgb(255, 206, 12)" ;
      }
    }
    // Toggle children on click.
    function click(d) {
      if (d3.event.defaultPrevented) return; // ignore drag
        
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update();
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
      var nodes = [], i = 0;

      function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
      }

      recurse(root);
      return nodes;
    }
})();