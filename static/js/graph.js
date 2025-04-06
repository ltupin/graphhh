document.addEventListener("DOMContentLoaded", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
        .style("visibility", "hidden");

    d3.json("/graph-data").then(data => {
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // Add links
        const link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("stroke", "#999");

        // Add link labels
        const linkLabels = svg.append("g")
            .selectAll("text")
            .data(data.links)
            .enter()
            .append("text")
            .attr("font-size", "12px")
            .attr("fill", "#555")
            .text(d => d.label);

        // Add nodes
        const node = svg.append("g")
            .selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("r", 10)
            .attr("fill", d => color(d.group))
            .on("mouseover", (event, d) => {
                if (d.group !== 1 && d.group !== 2 && d.group !== 3) { // Show tooltip only for members
                    tooltip.style("visibility", "visible")
                        .text(d.name);
                }
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            })
            .call(drag(simulation));

        // Add persistent labels for group nodes only
        const groupLabels = svg.append("g")
            .selectAll("text")
            .data(data.nodes.filter(d => d.group === 1 || d.group === 2 || d.group === 3)) // Filter for groups
            .enter()
            .append("text")
            .attr("font-size", "12px")
            .attr("fill", "#000")
            .attr("dx", 12) // Offset the label slightly to the right of the node
            .attr("dy", 4)  // Center the label vertically with the node
            .text(d => d.name);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabels
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            groupLabels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    });
});