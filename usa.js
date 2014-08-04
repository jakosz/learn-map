var width = 1200, 
    height = 800, 
    data, 
    states, 
    cState,
    cClick,
    answers = {'y': 0, 'n': 0, 'all': 0}, 
    sel = 'rgb(150,150,150)',
    desel = 'rgb(200,200,200)';

var svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .on('click', genPrompt);

d3.select('body')
    .on('keydown', function(){
        if (d3.event.keyIdentifier == 'F1') {
            d3.event.preventDefault();
            d3.selectAll('.state')
                .each(function(d){
                    if (d.properties.name == cState) {
                        d3.select(this).style({'fill': 'red'});
                    }
                })
        }
})

var text = svg.append('text')
   .attr('x', width / 2)
   .attr('y', 670)
   .style({'font-size': '40', 
           'text-anchor': 'middle', 
           'font-family': 'Roboto Light'});

svg.append('rect')
    .attr('x', (width / 2) - 50)
    .attr('y', 700)
    .attr('width', 100)
    .attr('height', 10)
    .style({'fill': sel});

function genPrompt(){ 
    if (cClick == cState) {
        cState = states[Math.round(Math.random() * (states.length - 1))];
        text.text('Click on ' + cState);
    }
}

function counts() {
    d3.selectAll('rect').remove();
    d3.select('svg')
        .append('rect')
        .attr('id', 'yrect')
        .attr('x', (width / 2) - 50)
        .attr('y', 700)
        .attr('width', 100 * (answers.y / answers.all))
        .attr('height', 10)
        .style({'fill': 'green'});
    var yrect = d3.select('#yrect');
    d3.select('svg')
        .append('rect')
        .attr('id', 'nrect')
        .attr('x', Number(yrect.attr('x')) + Number(yrect.attr('width')))
        .attr('y', 700)
        .attr('width', 100 * (answers.n / answers.all))
        .attr('height', 10)
        .style({'fill': 'red'});

}

// ++++

var projection = d3.geo.mercator()
    .center([-105.7, 41])
    .scale(900);

var path = d3.geo.path().projection(projection);

d3.json('us-geo.json', function(error, usa) {
    if (error) return console.error(error);

    //usa = topojson.feature(usa, usa.objects['us-geo']); 
    var usf = [];
    for (var i = 0; i < usa.features.length; i++) {
        var cName = usa.features[i].properties.name;
        if (cName != 'Hawaii' & cName != 'District of Columbia' & cName != 'Alaska') {
            usf.push(usa.features[i]);
        }
    }
    usa.features = usf;
    data = usa;
    states = data.features.map(function(x){ return x.properties.name; });

    svg.selectAll('states')
        .data(usa.features).enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'state')
        .attr('name', function(d){ return d.properties.name; })
        .style({'fill': desel, 'stroke': 'rgb(240,240,240)', 'stroke-width': 1})
        .on('mouseover', function(){ 
            d3.select(this).style({'fill': sel}); 
        })
        .on('mouseout', function(){ 
            d3.select(this)
                .style({'fill': desel})
            d3.select('#ctip').remove();
        })
        .on('click', function(){ 
            d3.select('#ctip').remove();
            var xy = d3.mouse(this);
            cClick = d3.select(this).attr('name');
            svg.append('text')
                .attr('x', xy[0])
                .attr('y', xy[1] - 10)
                .text(cClick)
                .attr('id', 'ctip')
                .style({'font-family': 'Roboto', 
                        'font-size': 30, 
                        'text-anchor': 'middle', 
                        'fill': 'rgba(100,100,100,1)'});
            if (cClick == cState) {
                answers.y += 1;
            } else {
                answers.n += 1;
            }
            answers.all += 1;
            counts();
            console.log(answers);
        });
    
    genPrompt();
});

