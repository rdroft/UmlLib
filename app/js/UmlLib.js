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
    var RenderedData = {
        getDefault: function(){
            return {x:10,y:10,width:100,height:20};
        }
    };

    var Renderer = function($factory,$rootRenderer){
         this.draw = function(obj,ld){}
    };

    var Layout = function(){
        var map=[]; //LayoutData hire
        this.getById=function(id){
            return map[id];
        };
        this.add=function(root){
            for (var j=0;j<root.leafs.length;j++){
               if(root.leafs[j].rendererData===undefined){
                 map[j]= RenderedData.getDefault();
               }else{
                  map[j] = root.leafs[j].rendererData;
               }
            }
        };
        this.layout=function(){}
    };

    var LayoutRenderer = function(ctx,config){
        this.activeCtx=ctx;
        this.canvasConfig = config;
        this.rendererFactory = new RendererFactory(this);
        this.layout = new Layout();
        this.drawGrid =function(ctx,width,height){
            var grid_size=50;
            var pix_s=0.5;
            var caption ={};
            caption.x=0;
            caption.y=0;
            caption.h = 18.5;
            caption.w1=150.5;
            caption.w2=163.5;
            //print grid
            ctx.lineWidth=0.4;
            for(var j =0;j < (height/grid_size);j++){
                ctx.moveTo(pix_s,j*grid_size+pix_s);
                ctx.lineTo(width-1.5,j*grid_size+pix_s);
            };
            for(var j =0;j <(width/grid_size);j++){
                ctx.moveTo(j*grid_size+pix_s,pix_s);
                ctx.lineTo(j*grid_size+pix_s,height);
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
        }(this.activeCtx,this.canvasConfig.width,this.canvasConfig.height);

        this.draw=function(rootObject){
            ctx.font = "15px Georgia";
            ctx.fillText(rootObject.type+' '+rootObject.name,12.5,13.5);
            this.drawLeafs(rootObject);
        };

        this.drawLeafs=function(rootObject){
            for(var j =0;j<rootObject.leafs.length;j++){
               var obj = rootObject.leafs[j];
               var renderer = this.rendererFactory.getRenderer(obj.rendererName);
               renderer.draw(obj,this.layout.getById(j),this.activeCtx);
            }
        };

        this.setDiagram = function(digram){
            this.layout.add(digram);
            this.draw(digram);
        };
    };

    var RendererFactory =function($rootRenderer){
        var renders={};
        var rootRenderer = $rootRenderer;
        this.getRenderer=function(name){
            return renders[name];
        };
        this.addRenderer=function(name,renderer){
            renders[name]= new renderer(this,rootRenderer);
        };
        this.addRenderer('BaseObject',function(factory,root){
            this.draw = function(obj,gd,ctx) {
                console.log('BaseCalled');
                ctx.fillText(obj.name, gd.x + 10.5, gd.y + 14.5);
                ctx.strokeRect(gd.x, gd.y, gd.width, gd.height);
                if (obj.leafs != undefined) {
                    //call attribute renderer
                    for (var i in obj.leafs) {
                    }
                }
            };
        });
        this.addRenderer('Connector',function(factory,root){
            this.draw = function(obj,gd,ctx){
                var frd = obj.from.rendererData;
                var trd = obj.to.rendererData;
                ctx.beginPath();
                ctx.moveTo(frd.x+frd.width/2,(frd.y+frd.height));
                ctx.lineTo(trd.x+trd.width/2,trd.y);
                ctx.stroke();
            };
        });
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
            var rootRenderer;
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
                rootRenderer = new LayoutRenderer(actx,{width:activeCanvas.width,height:activeCanvas.height});
            }(params);
            this.diagram = undefined;
            this.showDiagram=function(diagram){
                this.diagram = diagram;
                rootRenderer.setDiagram(diagram);
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
            this.leafs = [];
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