let width = 1000;
let height = 300;

const margin = {
    top: 20,
    left: 40,
    right: 70,
    bottom: 70
}


let y1label = 'Average Price';
let y2label = 'Total Library Size'
let xlabel = 'Country_code';
let file = 'Netflix_subscription_fee_Dec-2021.csv';

//Colour Scale for two type of component 
let colour = d3.scaleOrdinal()
    .range(["#ef8a62", "#67a9cf"])
    .domain([y1label, y2label]);



// let tip = d3.select('body')
//     .append('div')
//     .style('position', 'absolute')
//     .attr('width', '20')
//     .attr('height', '30')
//     .attr('class', 'tooltip')
//     .style('opacity', 0);      


//Scale for country
let x1Scale = d3.scaleBand()
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.65);

//Scale for average price
let y1Scale = d3.scaleLinear()
    .range([height-margin.top, margin.bottom]);

//Scale for total library size
let y2Scale = d3.scaleLinear()
    .range([height-margin.top, margin.bottom]);

//Scale for the second chart
let x2Scale = d3.scaleOrdinal();

//Colour Scale of income
let income_scale = d3.scaleSequential(d3.interpolateBlues);

let xaxis = d3.axisBottom(x1Scale);
let y1axis = d3.axisLeft(y1Scale);
let y2axis = d3.axisRight(y2Scale);

   
//component for showing detail
let detail = d3.select('#detail')
                .append('rect')
                .append('text')
                .text('Slide through the bar to get more detail')
                .attr('width', width)
                .attr('height', 30);
//create bar chart
let barchart = (y1label, y2label, file, type) => {
    d3.csv(file).then( (data) =>{ 
        let sortedData1 = data.slice().sort((a,b) => d3.ascending(+a[y1label], +b[y1label]))
        let svg = d3.select('#bar')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'svg');

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0, ${height-margin.top})`);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('stroke', colour([y1label]))
            .attr('transform', `translate(${margin.left}, 0)`);

        svg.append('text')
            .style('text-anchor','middle')
            .attr('transform', `translate(${margin.left+100}, 30)`)
            .text('Netflix Pricing Strategy Analyze')
            .style('font-size', 20);
        
        svg.append('text')
            .style('text-anchor','middle')
            .attr('transform', `translate(${width/2}, 50)`)
            .text('⟶ Average Subscription Fee in ascending order')
            .style('font-size', 15);

        let r_axis = svg.append('g')
            .attr('class', 'y axis')
            .attr('stroke', colour([y2label]))
            .attr('transform', `translate(${width - margin.right + 7}, 0)`);

        y1Scale.domain([0,d3.max(sortedData1, (d) => +d[y1label])]);
        y2Scale.domain([0,d3.max(sortedData1, (d) => +d[y2label])]);
        x1Scale.domain(d3.map(sortedData1, (d) => d[xlabel]));
        x2Scale.range([0,x1Scale.bandwidth()]).domain([y1label, y2label]);
//Code to create multi bar chart
//taken from Stack Overflow post by altocumulus and moodygeek
//accessed 29-4-2022
//https://stackoverflow.com/questions/33691800/d3-js-grouped-bar-chart-using-nested-file
       
        let module = svg.selectAll('.module')
                        .data(sortedData1)
                        .enter().append('g')
                        .attr('class', 'module')
                        .attr('transform', (d) => {
                            return `translate (${x1Scale(d[xlabel])}, 0)`;});

        let legend = svg.selectAll('.legend')
                        .data([y1label, y2label])
                        .enter()
                        .append('g')
                        .attr('class', 'legend')
                        .attr('transform', (d, i) => `translate(0, ${i*20})`)
            
        legend .append('rect')
                .attr('x', width-18)
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', (d) => colour(d))
            
        legend.append('text')
                .attr('x', width-24)
                .attr('y', 9)
                .attr('dy', '0.35em')
                .style('text-anchor', 'end')
                .text((d) => d)     

        
        module.selectAll('rect')
            .data((d) => {
                let arr = [];
                arr.push(
                    {
                        name: y1label,
                        value: +d[y1label],
                        key: d[xlabel],
                        full: d['Country']
                    }
                )
                arr.push(
                    {
                        name: y2label,
                        value: +d[y2label],
                        key: d[xlabel],
                        full: d['Country']
                    }
                )
                return arr;
             })
            .join(  (enter) => 
                    {enter.append('rect')
                        .attr('width', x1Scale.bandwidth())
                        .attr('y', height - margin.top)
                        .attr('height', 0)
                        .attr('x', (d) => x2Scale(d.name))
                        .attr('transform', 'translate(-2,0)')
                        .on('mouseover', function (event, d){
                            let cur_d = d;
                            let current = d3.select(this);
                            if(current.style.opacity == 1){
                                current.attr('opacity', 0.5)
                                        .attr('stroke', 'black');
                            }
                            else{
                                current.attr('stroke', 'black');
                            }
                            function text(){
                                let result = ''
                                if(cur_d.name === 'Average Price'){
                                    result = 'Country: ' + cur_d.full + ' | ' + 'Average Price: $US ' + cur_d.value;
                                }else{
                                    result = 'Country: ' + cur_d.full + ' | ' + 'Total Library Size: ' + cur_d.value;
                                }
                                return result;
                            }    
                            detail.text(() => text())
                      
                        } )
                        .on('mouseout', function (){
                            let current = d3.select(this);
                            if(current.style.opacity == 0.5){
                                current.attr('opacity', 1)
                                        .attr('stroke', 'none');
                            }
                            else{
                                current.attr('stroke', 'none');
                            }
                        })
                        .transition()
                        .duration(1000)
                        .attr('y', (d) => {
                            let result = y1Scale(+d.value);
                            if(d.name == 'Total Library Size'){
                                result = y2Scale(+d.value);
                            }
                            return result; })
                        .attr('height', (d) => { 
                            let result = y1Scale(+d.value);
                            if(d.name == 'Total Library Size'){
                                result = y2Scale(+d.value);
                            }
                            return (height - margin.top - result)})
                        .attr('fill', (d) => { 
                            return `${colour(d.name)}` })
                        .attr('opacity', (d) => {
                            if(type === 'price' && d.name === y2label){
                                
                                return 0.1;
                            }
                            else if(type === 'library' && d.name === y1label){
                                
                                return 0.1;
                            }
                            else{
                                
                                return 1;
                            }
                        })
                    },
//end of referennced code.
                    (update) =>
                    {update.transition()
                        .duration(1000)
                        .attr('y', (d) => y1Scale(d[y1label]))
                        .attr('height', (d) => height - margin.top - y1Scale(d[y1label]))
                        .attr('opacity', (d) => {
                            if(type === 'price' && d.name === y2label){
                                return 0.1;
                            }
                            else if(type === 'library' && d.name === y1label){
                                return 0.1;
                            }
                            else{
                                return 1;
                            }
                        })},
                    (exit) =>
                    {exit.transition()
                            .duration(1000)
                            .attr('height', 0)
                            .remove();}
                    )
       
        svg.select('.x.axis')
            .transition()
            .duration(1000)
            .call(xaxis);
    
        svg.select('.y.axis')
            .transition()
            .duration(1000)
            .call(y1axis);

        r_axis.transition()
                .duration(1000)
                .call(y2axis);
    })};


let l_height = 350;
let l_width = 1000;

let l_svg = d3.select('#linear')
            .append('svg')
            .attr('id', 'l_svg')
            .attr('width', l_width)
            .attr('height', l_height)
            .style('position', 'absolute')
            .style('background-color', '#5ab4ac');

let l_detail = l_svg.append('text')
                    .attr('width', l_width/5)
                    .attr('height', l_height/3)
                    .style('display', 'block')
                    .style('background-color', '#ffffff')
                    .attr('x', 1*(l_width/4))
                    .attr('y', 2*(l_height/5))
                    .attr('id', 'l_detail')
                    .text('Click the block to show more details.');


let l_describe = l_svg.append('text')
                    .text( '⟶ Average Subscription Fee in ascending order')
                    // .attr('text-anchor', 'middle')
                    .attr('transform', `translate(${l_width/3}, ${margin.top+10})`);

                    

l_svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, 70)`)
    
l_svg.append('g')
    .attr('class', 'legendLinear')
    // .attr('transform', `translate()`)
    


let l_x1Scale = d3.scaleBand()
                .range([margin.left, l_width-margin.right]);

let l_xaxis = d3.axisBottom(l_x1Scale);

let y_pos = 50;



function mousein(){
    d3.select(this)
        .attr('opacity', 0.5);

}

function mouseout(){
    let current =  d3.select(this)
    current
        .attr('opacity', 1)
        .attr('height', l_x1Scale.bandwidth())
        .attr('width', l_x1Scale.bandwidth())
        .attr('x', (d) => l_x1Scale(d['code']))
        .attr('y', y_pos);
}
function onClick(d){
    l_detail.transition()
            .duration(1000)
            .attr('opacity', 1);
    
    let text = 'Country:  '+ d.country + ' | ' + 'Average Price: US$' + d.price + ' | ' + 'Income per person(2020): US$' + d.income;

    if(d.income == ''){
        text = 'Country:  '+ d.country + ' | ' + 'Average Price: US$' + d.price + ' | ' + 'Income per person(2020): ' + 'No data';
    }

    l_detail.html(text);

}

//create long bar chart
let linearchart = () =>{
    let l_data = [];

    d3.csv(file).then( (data) => {
        let asc_price = data.slice().sort((a,b) => d3.ascending(+a[y1label], +b[y1label]));
        for( ele in asc_price){
            l_data.push({
                price:asc_price[ele][y1label],
                country:asc_price[ele]['Country'],
                code:asc_price[ele][xlabel],
                income: ''
            })
        }
        d3.csv('income_2020.csv').then( (data) => {
            for(let i in data){
                for(let ele in l_data){
                    if(`${data[i]['country']}` === `${l_data[ele].country}`){
                        l_data[ele].income = `${data[i]['2020']}`;
                    
                    }
                }        
            }
            l_data = l_data.slice(0, l_data.length-1);
            l_x1Scale.domain(l_data.map((d) => d['code']));
            income_scale.domain([0, d3.max(l_data, (d) => d['income'])]);
            
            l_svg.selectAll('rect')
                .data(l_data)
                .join( 
                    (enter) => {
                        enter.append('rect')
                        .attr('width', l_x1Scale.bandwidth())
                        .attr('height', l_x1Scale.bandwidth())
                        .attr('fill', (d) => {
                            if(d['income'] === ""){
                                return 'black'}
                            else{
                                return income_scale(+d['income'])
                            }})
                        .attr('id', (d, i) => `l_block${i}`)
                        .attr('x', (d) => l_x1Scale(d['code']))
                        .attr('y', y_pos)
                        .on('mouseover', mousein )
                        .on('mouseout', mouseout)
                        .on('click', (event, d) => onClick(d));
                    },
                    (update) => {
                        update.transition()
                            .duration(1000)
                            .attr('width', l_x1Scale.bandwidth())
                            .attr('height', l_x1Scale.bandwidth())
                            .attr('fill', (d) => {
                                if(d['income'] === ""){
                                    return 'black'}
                                else{
                                    return income_scale(+d['income'])
                                }})
                    },
                    (exit) => {
                        exit.transition()
                            .duration(1000)
                            .remove();
                    }
                            
                    
                )

            let legend_data = ['0', '9051', '18101', '27151', '36201', '45251', '54301', '63351', '72401', '81451'];
            let legend_data_label = ['0 - 9k', '9k-18k', '18k-27k', '27k-36k', '36k-45k', 
                                    '45k-54k', '54k-63k', '63k-72k', '72k-81k', '81k-90k'];
            l_svg.append('text')
                .attr('x', margin.left)
                .attr('y', 120)
                .attr('width', 30)
                .attr('height', 30)
                .text('Income per person in 2020($US)');
            let legendLinear = l_svg.selectAll('.legend')
                                    .data(legend_data)
                                    .enter()
                                    .append('g')
                                    .attr('class', '.legend')
                                    .attr('transform', (d,i) => `translate(0, ${(i*20)+130})`);

            legendLinear.append('rect')
                        .attr('x', margin.left)
                        .attr('width', 18)
                        .attr('height', 18)
                        .attr('fill', (d) => income_scale(+d));

            legendLinear.append('text')
                        .attr('x', margin.left+80)
                        .attr('y', 9)
                        .attr('dy', '0.35em')
                        .style('text-anchor', 'end')
                        .text((d,i) => legend_data_label[i]); 

           
            l_svg.select('.x.axis')
                .transition()
                .duration(750)
                .call(l_xaxis);
            // l_svg.select('.legendLinear')
            //     .call(legendLinear);
        
        })
    })
    
    
    
}
function update(type){
    d3.select('#svg').remove();
    barchart(y1label, y2label, file, type);
}

// d3.select('#price')
//     .on('change', update('price'));
// d3.select('#library')
//     .on('change', update('library'));
// d3.select('#all')
//     .on('change', update('all'));

// d3.select('#price')
//     .on('change', console.log('run'));

barchart(y1label, y2label, file, 'all');

linearchart();


let handleChange = (elem) =>{
    d3.select('.svg').remove();
    update(elem.value);
    // if(elem.value == "price"){
    //     console.log('run1');
    //     barchart(y1label, y2label, file, 'price');
    // }
    // else if(elem.value == "library"){
    //     console.log('run2');
    //     barchart(y1label, y2label, file, 'library');
    // }else if(elem.value == "all"){
    //     console.log('run3');
    //     barchart(y1label, y2label, file, 'all');
    // }
}


