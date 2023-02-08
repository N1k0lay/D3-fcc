/* global d3 */
const svgContainer = d3
    .select('.visHolder')
    .append('svg')


d3.json(
    'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'
)
    .then(data => {


        const width = 800,
            height = 400,
            padding = 40,
            barWidth = width / data.data.length;

        svgContainer
            .attr('width', width + 100)
            .attr('height', height + 60);

        const tooltip = d3
            .select('.visHolder')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);

        const overlay = d3
            .select('.visHolder')
            .append('div')
            .attr('class', 'overlay')
            .style('opacity', 0);

        let years = data.data.map(function (item) {
            let quarter;
            let temp = item[0].substring(5, 7);

            if (temp === '01') {
                quarter = 'Q1';
            } else if (temp === '04') {
                quarter = 'Q2';
            } else if (temp === '07') {
                quarter = 'Q3';
            } else if (temp === '10') {
                quarter = 'Q4';
            }

            return item[0].substring(0, 4) + ' ' + quarter;
        });


        //Ось Y
        const GDP = data.data.map(item => item[1]);
        const maxGDP = d3.max(GDP);
        const linearScale = d3.scaleLinear()
            .domain([0, maxGDP])
            .range([0, height - padding]);

        let scaleGDP = GDP.map(item => linearScale(item))

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data.data, d => d[1])])
            .range([height, padding]);

        const yAxis = d3.axisLeft(yScale);

        d3.select('svg')
            .append('g')
            .attr('transform', `translate(${padding}, 0)`)
            .call(yAxis)
            .attr('id', 'y-axis')

        //Ось X

        let yearsDate = data.data.map((item) => new Date(item[0]));

        let xMax = new Date(d3.max(yearsDate));

        xMax.setMonth(xMax.getMonth() + 3);

        const xScale = d3.scaleTime()
            .domain([d3.min(yearsDate), xMax])
            .range([0, width]);

        const xAxis = d3.axisBottom(xScale);

        d3.select('svg')
            .append('g')
            .attr('transform', `translate(${padding},${height})`)//Расположение оси X
            .call(xAxis)
            .attr('id', 'x-axis')

        d3.select('svg')
            .selectAll('rect')
            .data(scaleGDP)
            .enter()
            .append('rect')
            .attr('data-date', (d, i) => data.data[i][0])
            .attr('data-gdp', (d, i) => data.data[i][1])
            .attr('index', (d, i) => i)
            .attr('class', 'bar')
            .attr('x', (d, i) => {
                return xScale(yearsDate[i])
            })
            .attr('y', d => height - d)
            .attr('width', barWidth)
            .attr('height', d => d)
            .style('fill', '#33adff')
            .attr('transform', `translate(${padding}, 0)`)
            .on('mouseover', function (event, d) {
                let i = this.getAttribute('index');
                overlay
                    .transition()
                    .duration(0)
                    .style('height', d + 'px')
                    .style('width', barWidth + 'px')
                    .style('opacity', 0.9)
                    .style('left', i * barWidth - barWidth * 7 + 'px')
                    .style('top', height - d + 'px')
                    .style('transform', 'translateX(60px)');

                tooltip
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                tooltip
                    .html(
                        years[i] +
                        '<br>' +
                        '$' +
                        GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
                        ' Billion'
                    )
                    .attr('data-date', data.data[i][0])
                    .style('left', i * barWidth + 30 + 'px')
                    .style('top', height - 100 + 'px')
                    .style('transform', 'translateX(60px)');
            })
            .on('mouseout', function () {
                tooltip.transition().duration(200).style('opacity', 0);
                overlay.transition().duration(200).style('opacity', 0);
            });


    })
    .catch(e => console.log(e));