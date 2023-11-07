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
    delete this.myData
    console.log("initial load:",this)
    
},

formatData: function(data, config) {
    // console.log(data)
    let fields = []
    for(var i = 0;i<data.fields.length;i++){
        fields.push(data.fields[i].name)
    }
    // console.log(fields)
    data.rows.splice(0,0,fields)

    let newArr=[];
    let category_arr = [];

    for(var x=0;x<data.rows.length;x++){
        for(var i=0;i<data.rows[x].length;i++){
            if(x == 0){
                newArr.push([data.rows[x][i]])
            }
            else{
                newArr[i].push(data.rows[x][i])
            }
        }
        if(x == 0){
            data.yaxis_label = data.rows[x][0];
        }
        else{
            category_arr.push(data.rows[x][0])
        }
    }

    newArr.splice(0,1)
    data.rows = newArr;
    data.category = category_arr;
    data.category.push("")
    if(!this.hasOwnProperty('myData')){
        this.myData = data
    }
    return this.myData;
},
 

getInitialDataParams: function() {
    return ({
        outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
        // count: 10000
    });
},

// Override to respond to re-sizing events
reflow: function() {
    this.chart.resize({height: (this.$el.height() - 20), width: this.$el.width()});
  },

updateView: function(data, config) {

    let properties = {
        data: {
          columns: data.rows,
          type: "line", // for ESM specify as: bar()
          groups:[
          ]
        },
        axis:{
            x:{
                type: 'category',
                categories: data.category,
                label: {
                    position: "outer-center"
                }
            },
            y: {
                show: true,
                label: {
                    position: "outer-middle"
                }
            },
            y2: {
                show: false,
                label: {
                    position: "outer-middle"
                }
            }

        },
        bar: {
          width: {
            ratio: 0.5
          }
        },
        size: {
            height: "auto"
          },
        bindto: "#"+this.id
      }

    // configs 
    var line_overlay_field = config[this.getPropertyNamespaceInfo().propertyNamespace + 'line_overlay_fields'] || '';
    var show_values = config[this.getPropertyNamespaceInfo().propertyNamespace + 'show_values'] || "false";
    var legend = config[this.getPropertyNamespaceInfo().propertyNamespace + 'legend_position'] || "bottom";

    //   config general 
    show_values = show_values=="true" ? true : false

    //   process general 
    if(show_values){
        properties.data["labels"] = {
            centered: true,
            colors: "#000",
        }
    }
    if(legend=="none"){
        properties["legend"] = {
            show: false
        }
    }
    else{
        properties["legend"] = {
            show: true,
            position: legend
        }
    }


    // X
    var xaxis_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'xaxis_label'] || false

    // config/process X 
    if(xaxis_label != false){
        properties.axis.x.label['text'] = xaxis_label
    }

    // Y 
    var yaxis_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'yaxis_label'] || this.myData.yaxis_label;
    var yaxis_min = config[this.getPropertyNamespaceInfo().propertyNamespace + 'yaxis_min'] || false;
    var yaxis_max = config[this.getPropertyNamespaceInfo().propertyNamespace + 'yaxis_max'] || false;
    var yaxis_field_group = config[this.getPropertyNamespaceInfo().propertyNamespace + 'yaxis_field_group'] || 'false';

    // config y 
    if(yaxis_field_group!=""){
        yaxis_field_group = yaxis_field_group.split(",")
        yaxis_field_group.forEach((element,index) => {
            yaxis_field_group[index] = element.trim()
        });
    }

    // process y
    if(yaxis_field_group.length > 0){
        properties.data.groups.push(yaxis_field_group)
    }

    if(yaxis_min != false){
        properties.axis.y["min"] = parseInt(yaxis_min)
    }
    if(yaxis_max != false){
        properties.axis.y["max"] = parseInt(yaxis_max)
    }
    properties.axis.y.label['text'] = yaxis_label

    // Y2 
    var y2_use = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y2_use'] || 'false';
    var y2_fields = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y2axis_fields'] || false;
    var y2axis_label = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y2axis_label'] || false;
    var y2axis_min = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y2axis_min'] || false;
    var y2axis_max = config[this.getPropertyNamespaceInfo().propertyNamespace + 'y2axis_max'] || false;

    // config y2 
    y2_use = y2_use == "true" ? true : false;
    y2_fields_list = {}
    if(y2_fields !== false)
    y2_fields = y2_fields.split(",");
    for(var i = 0; i<y2_fields.length;i++){
        y2_fields_list[y2_fields[i].trim()] = "y2"
    }

    console.log(y2_fields_list)

    // process y2
    if(y2_use){
        properties.axis.y2.show = true;
        properties.data["axes"] = y2_fields_list
        if(y2axis_min != false){
            properties.axis.y2["min"] = parseInt(y2axis_min)
        }
        if(y2axis_max != false){
            properties.axis.y2["max"] = parseInt(y2axis_max)
        }
        if(y2axis_label != false){
            properties.axis.y2.label['text'] = y2axis_label
        }
    }

    // colors 
    let fieldColors = config[this.getPropertyNamespaceInfo().propertyNamespace + 'fieldColors'] || '';
    let bg_color = config[this.getPropertyNamespaceInfo().propertyNamespace + 'bg_color'] || 'transparent';
    let txtval_color = config[this.getPropertyNamespaceInfo().propertyNamespace + 'txtval_color'] || false;

    // config/process colors 
    if(fieldColors !=""){
        try{
            fieldColors = JSON.parse(fieldColors)
            properties.data['colors'] = fieldColors
        }catch (error) {
            throw new SplunkVisualizationBase.VisualizationError(
                'Colors only supports a valid json format.'
            );
        }

        if(bg_color != false){
            properties['background'] = {
                color: bg_color
            }
        }
        if(show_values){
            if(txtval_color != false){
                properties.data.labels.colors = txtval_color
            }
        }

    }





    // process line overlay \
    let has_line_overlay = false;
    let line_overlay = {}
    if(line_overlay_field.length>0){
        has_line_overlay = true;
        line_overlay_field = line_overlay_field.split(",")
        for(var i = 0;i<line_overlay_field.length;i++){
            line_overlay[line_overlay_field[i].trim()] = "line"
        }
    }
    // set line overlay 
    properties.data["types"] = line_overlay

    console.log(properties)
  
    // Fill in this part in the next steps.
    this.chart = bb.bb.generate(properties);
   
}
});
});
