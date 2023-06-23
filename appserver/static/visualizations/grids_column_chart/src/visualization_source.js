define([
    'billboard.js',
    'jquery',
    'api/SplunkVisualizationBase',
    'api/SplunkVisualizationUtils',
    'd3'
],
function(
    bb,
    $,
    SplunkVisualizationBase,
    SplunkVisualizationUtils,
    d3
) {

return SplunkVisualizationBase.extend({

initialize: function() {
    // Save this.$el for convenience
    // this.$el = $(this.el);
     
    // // Add a css selector class
    // this.$el.addClass('splunk-radial-meter');
    this.$el = $(this.el);

  
    this.id="grids-column"+Math.floor((Math.random() * 1000) + 1);
    this.$el.append('<div class="grids-viz"><div id="'+this.id+'"></div></div>');

    
},

formatData: function(data, config) {
    
    console.log(data)
    let fields = []
    for(var i = 0;i<data.fields.length;i++){
        fields.push(data.fields[i].name)
    }
    console.log(fields)
    data.rows.splice(0,0,fields)

    let newArr=[];
    let category_arr = [];
    for(var x=0;x<data.rows.length;x++){
        for(var i=0;i<data.rows[x].length;i++){
            if(x == 0){
                newArr.push([data.rows[x][i]])
            }
            else{
                category_arr.push(data.rows[x][0])
                newArr[i].push(data.rows[x][i])
            }
        }
    }

    newArr.splice(0,1)
    data.rows = newArr;
    data.category = category_arr;
    data.category.push("")
    return data;
},
 

getInitialDataParams: function() {
    return ({
        outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
        // count: 10000
    });
},

updateView: function(data, config) {

    console.log('updateView data',data)
    // for(var i=1;i<data[0].length;i++){
    //     dataCategories.push(data[0][i])
    // }

    console.log(data.category)
    console.log(data.rows)
  
    // Fill in this part in the next steps.
    this.chart = bb.bb.generate({
        data: {
          columns: data.rows,
          type: "bar", // for ESM specify as: bar()
          types: {
            'Total Defects':"line"
          },
          axes: {
            Compliance: "y2"
          },
          groups:[
            [
                "Critical Defects",
                "High Defects",
                "Medium Defects"
            ]
          ]
        },
        axis:{
            x:{
                type: 'category',
                categories: data.category
            },
            y2: {
                show: true,
                type: "log",
                min: 10,
                max: 100
            }

        },
        bar: {
          width: {
            ratio: 0.5
          }
        },
        bindto: "#"+this.id
      });
   
}
});
});
