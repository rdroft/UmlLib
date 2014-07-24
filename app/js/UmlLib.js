/**
 * Created by rpashniev on 22.07.2014.
 */
'use strict';
(function(global){
    var DiagramColours = {
        colours: {c1: '#FFEC94', c2: '#FFAEAE', c3: '#FFF0AA', c4: '#B0E57C', c5: '#B4D8E7', c6: '#56BAEC'},
        scheme3: {background: '#ffffff', block: '#FFF0AA', text: '#000000'},
        scheme1: {background: '#ffffff', block: '#56BAEC', text: '#000000'},
        scheme2: {background: '#ffffff', block: '#B4D8E7', text: '#000000'}
    };

    /**
     * @param {Number} [params.x]
     * @param {Number} [params.y]
     * @param {Number} [param.width]
     * @param {Number} [params.height]
     * @param {Number} [params.fontSize]
     * @param {String} [colour scheme]
     */
    var RenderedData = function(params){
        this.getDefault = function(){
            return {x:10,y:10,width:100,height:20};
        };
    };

    var Renderer = function($factory,$rootRenderer){
         this.draw = function(obj,obj_view){}
    };

    var LayoutRenderer = function($factory,$rootRenderer,diagram){
        this.initLayout=function(diagram){

        }(diagram);
    };

    var RendererFactory =function(ctx){
        var renderes={};
        this.getRenderer=function(name){
            return renderes[name];
        };
        this.addRenderer=function(name,renderer){
            console.log('add renderer: '+name);
            renderes[name]= new renderer(this);
        };
    };

    var RendererFactory1 =function(){
        var renderes={};
        var pix_s=0.5;
        /**Return renderer for object
         * @param {String} [name] name for corresponding renderer
         * */
        this.getRenderer=function(name){
            return renderes[name];
        };
        this.addRenderer=function(name,renderer){
            console.log('add renderer: '+name);
            renderes[name]=renderer;
        };

        this.__init=function(){
            this.addRenderer('Diagram',{
                draw:function(object,ctx,gd,info){
                    var grid_size=50;
                    var caption ={};
                    caption.x=0;
                    caption.y=0;
                    caption.h = 18.5;
                    caption.w1=150.5;
                    caption.w2=163.5;
                    //print grid
                    ctx.lineWidth=0.4;
                    for(var j =0;j < (info.height/grid_size);j++){
                        ctx.moveTo(pix_s,j*grid_size+pix_s);
                        ctx.lineTo(info.width-1.5,j*grid_size+pix_s);
                    };
                    for(var j =0;j <(info.width/grid_size);j++){
                        ctx.moveTo(j*grid_size+pix_s,pix_s);
                        ctx.lineTo(j*grid_size+pix_s,info.height);
                    };
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.fillStyle = 'white';
                    ctx.moveTo(caption.x,caption.h);
                    ctx.lineTo(caption.w1,caption.h);
                    ctx.lineTo(caption.w2,caption.y);
                    ctx.lineTo(caption.x,caption.y);
                    ctx.lineTo(caption.x,caption.h);
                    ctx.fill();
                    ctx.lineWidth=1;
                    ctx.fillStyle = 'black';
                    ctx.stroke();
                    ctx.font = "15px Georgia";
                    ctx.fillText(object.type+' '+object.name,12.5,13.5);
                    for(var obj in object.leafs){
                        var child = object.leafs[obj];
                        if(name !=undefined){
                            var renderer = renderes[child.rendererName];
                            renderer.draw(child,ctx,child.rendererData,info);
                        }
                    }

                }
            });

            this.addRenderer('BaseObject',{
                 draw:function(object,ctx,gd,info){
                    console.log('BaseCalled');
                    ctx.fillText(object.name,gd.x+10.5,gd.y+14.5);
                    ctx.strokeRect(gd.x,gd.y,gd.width,gd.height);
                    if(object.leafs!=undefined){
                       //call attribute renderer
                        for(var i in object.leafs){

                        }
                    }
                }
            });

            this.addRenderer('Connector',new function(){
                this.draw = function(object,ctx,gd,info){
                  var frd = object.from.rendererData;
                  var trd = object.to.rendererData;
                  ctx.beginPath();
                  ctx.moveTo(frd.x+frd.width/2,(frd.y+frd.height));
                  ctx.lineTo(trd.x+trd.width/2,trd.y);
                  ctx.stroke();
                };
            });
        };
        this.__init();
    };
    global.UmlLib = {
        /**
         * @constructor
         * @param {Object} params
         * @param {String} [params.containerId] mandatory ID of container
         * @param {Number} [params.width]
         * @param {Number} [params.height]
         * @param {String} [params.background];
         * */
        View:function(params){
            var rootElement;
            var activeCanvas;
            var actx;
            /**
             * Renderer Factory
             * created to decouple Renderer and UML object itself
             * objects has a textural reference to Renderer and RendererData
             * Partial Renderer should know how to render object
             * */
            var rendererFactory = new RendererFactory1();
            function getElement(elementId){
                return document.getElementById(elementId);
            };
            function bindCanvas(params,parent){
                var canvas = document.createElement("canvas");
                canvas.width = params.width;
                canvas.height = params.height;
                parent.appendChild(canvas);
                return canvas;
            };
            function initializeContext(canvasElement){
                var ctx = canvasElement.getContext("2d");
                //ctx.fillStyle = DiagramColours.colours.c5;
                //ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
                return ctx;
            };
            this.__init=function(params){
                rootElement = getElement(params.containerId);
                activeCanvas = bindCanvas(params,rootElement);
                actx = initializeContext(activeCanvas);
            }(params);
            this.diagram = undefined;
            this.showDiagram=function(diagram){
                this.diagram = diagram;
                //object,ctx,gd,info
                var renderer = rendererFactory.getRenderer('Diagram');
                renderer.draw(diagram,actx,undefined,{width:activeCanvas.width,height:activeCanvas.height});
            };
        },
        /**
         * UmlLibrary Base Object
         * @constructor
         * @memberof UmlLib
         * @param {Object} params
         * @param {Object} [params.rendererData] - optional
         * @param {String} [params.name] - element Name
         * @param {String} [params.stereotype]
         * */
        UObject:function(params){
            this.rendererName='BaseObject';
            this.name="Empty";
            this.rendererData={};
            this.__init =function(params){
                this.rendererData = (params.rendererData||{x:50,y:50,width:150,height:40});
                if(params.name!=undefined) {
                    this.name = params.name;
                }
            }
            this.__init(params);
        },
        Connector:function(from,to,params){
            this.rendererName='Connector';
            this.from = from;
            this.to = to;
            this.__init=function(params){
          }(params);
        },
        /**
         * @constructor
         * @param {Object} [params]
         * @param {String} [params.name]
         * */
        Diagram:function(params){
            this.name = 'Diagram'
            this.type = 'Base'
            this.leafs = [];
            this.addObject = function(object){
                this.leafs.push(object);
            };
            this.__init = function(params){
                 if(params!=undefined) {
                     this.name = params.name;
                 }
            };
            this.__init(params);
        },
        SequenceDiagram:function(params){
            this.__init(params);
            this.type='Sequence';
        }
    };
    var extend=function(child,parent){
        console.log('extend');
        child.prototype = parent;
        child.prototype.constructor = child;
    };

    console.log('vv');
    var init = function(lib){
        console.log('init');
        extend(lib.SequenceDiagram, new lib.Diagram());
    }(global.UmlLib);

})(this);