/**
 * Created by rpashniev on 22.07.2014.
 */
'use strict';
(function(global){

    var Font ={
        a1:'Georgia, serif',
        a2:'Times New Roman',
        a3:'Comic Sans MS'
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

    /**Layout
     * Diagram Layout manager
     * @constructor
     *
     * */
    var Layout = function(){
        var map=[]; //LayoutData hire
        var leafs=[];
        var draggedObjectId=undefined;
        this.getById=function(id){
            return map[id];
        };
        this.add=function(root){
            leafs = root.leafs;
            for (var j=0;j<root.leafs.length;j++){
               if(root.leafs[j].rendererData===undefined){
                 map[j]= RenderedData.getDefault();
               }else{
                  map[j] = root.leafs[j].rendererData;
               }
            }
        };
        this.setDraggedObjectGd=function(gd){
             draggedObjectId = gd;
        };
        this.getDraggedObjectGP=function(){
            return draggedObjectId;
        }
        this.getPlaceLocationFor=function(x,y,w,h){};
        this.getGP = function(x,y){
            for(var v in map){
                var gd = map[v];
                if(gd.x <= x&&x <=gd.x+gd.width){
                    if(gd.y<=y&&y<=(gd.y+gd.height)){
                        map[v].ox = x-gd.x;
                        map[v].oy = y-gd.y;
                        return map[v];
                    }
                }
            }
            return undefined;
        };

        this.getObject = function(x,y){
           for(var v=0;v<map.length;v++){
               var gd = map[v];
               if(gd.x <= x&&x <=gd.x+gd.width){
                   if(gd.y<=y&&y<=(gd.y+gd.height)){
                       return leafs[v];
                   }
               }
           }
            return undefined;
        };
    };

    /**Layout Renderer Constructor
     * Root renderer
     * @constructor
     * @param {Context2D} [ctx]
     * @param {Object} [config]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
    // **/
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
        };
        this.draw=function(rootObject){
            ctx.font = '15px '+Font.a3;
            ctx.fillText(rootObject.type+' '+rootObject.name,12.5,13.5);
            this.drawLeafs(rootObject);
        };

        this.redraw=function(){
          this.canvasConfig.canvas1.width =this.canvasConfig.canvas1.width;
          this.drawGrid(this.activeCtx,this.canvasConfig.width,this.canvasConfig.height);
          this.draw(this.diagram);
        };
        this.drawLeafs=function(rootObject){
            for(var j =0;j<rootObject.leafs.length;j++){
               var obj = rootObject.leafs[j];
               var renderer = this.rendererFactory.getRenderer(obj.rendererName);
               renderer.draw(obj,this.layout.getById(j),this.activeCtx);
            }
        };
        this.diagram=undefined;
        this.setDiagram = function(digram){
            this.layout.add(digram);
            this.diagram = digram;
            this.draw(digram);

        };
        this.drawGrid(this.activeCtx,this.canvasConfig.width,this.canvasConfig.height)
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
            var rootRenderer = root;
            this.draw = function(obj,gd,ctx){
                var src = obj.from.rendererData;
                var dst = obj.to.rendererData;
                var sx = src.x+src.width/2;
                var sy = src.y+src.height/2;
                var dx = dst.x+dst.width/2;
                var dy = dst.y+dst.height/2;
                if(sy>dy+src.height){
                    sy=src.y;
                    dy=dst.y+dst.height;
                }else if(sy<dy-dst.height){
                    sy=src.y+src.height;
                    dy=dst.y;
                }else {
                    if (sx < dx) {
                        dx = dst.x;
                        sx = src.x+src.width;
                    }else{
                        dx = dst.x+dst.width;
                        sx = src.x;
                    }
                }


                ctx.beginPath();
                ctx.moveTo(sx,sy);
                ctx.lineTo(dx,dy);
                console.log("connector "+sx+':'+sy +' to '+dx+':'+dy);
                ctx.stroke();

            };
        });

        this.addRenderer('Lifeline',function(factory,root){
           this.draw=function(obj,gd,ctx){
              if(gd.lineHeight ===undefined) {
                  gd.lineHeight = 300;
              }
              var startLineX =gd.x+(gd.width/2);
              ctx.fillText(obj.name, gd.x + 10.5, gd.y + 14.5);
              ctx.strokeRect(gd.x,gd.y,gd.width,gd.height);
              ctx.beginPath();
              ctx.moveTo(startLineX,gd.y+gd.height);
              ctx.lineTo(startLineX,gd.y+gd.lineHeight);
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

            function createElement(obj,x,y,w){
                var el=document.createElement('input');
                el.type='text';
                el.value=obj.name;
                el.style.position='absolute';
                el.style.top=y+70+'px';
                el.style.left=x+90+'px';
                el.style.width=(w-10)+'px';
                el.addEventListener('keyup',function(event){
                    if(event.keyCode==13||event.which==13){
                        obj.name=el.value;
                        console.log("redr");
                        var cte = document.getElementById(rootElement.id);
                        if(cte){
                            el.somef=true;
                            cte.removeChild(el);
                        }

                    }
                }.bind(this));
                el.addEventListener('blur',function(event){
                    obj.name=el.value;
                    console.log('blur');
                    if(!el.somef){
                        document.getElementById(rootElement.id).removeChild(el);
                    }
                }.bind(this));
                document.getElementById(rootElement.id).appendChild(el);
                el.focus();
            }
            function bindCanvas(params,parent){
                var canvas = document.createElement("canvas");
                canvas.width = params.width;
                canvas.height = params.height;
                parent.appendChild(canvas);
                return canvas;
            };
            ///move this to another place
            this.getMousePosition = function (event) {
                var rect = activeCanvas.getBoundingClientRect();
                var rx = event.clientX - rect.left;
                var ry = event.clientY - rect.top;
                return {x: rx, y: ry};
            };
            this.mouseDown=function(event){
                var point =this.getMousePosition(event);
                var gp = rootRenderer.layout.getGP(point.x,point.y);
                console.log('gd  '+point.x+'  '+point.y+JSON.stringify(gp));
                if (gp !=undefined){
                    gp.dragged = true;
                };
                rootRenderer.layout.setDraggedObjectGd(gp);
            };
            this.mouseUp=function(event){
                rootRenderer.layout.setDraggedObjectGd(undefined);
            };

            this.mouseMove = function(event){
                var point = this.getMousePosition(event);
                var rd = rootRenderer.layout.getDraggedObjectGP();
                if(rd!=undefined){
                    rd.x=point.x-rd.ox;
                    rd.y=point.y-rd.oy;
                    rootRenderer.redraw();
                }
            };
            this.doubleClick=function(event){
               var point =  this.getMousePosition(event);
               var rd = rootRenderer.layout.getGP(point.x,point.y);
                console.log('double +x:' +JSON.stringify(point)+'  ' +JSON.stringify(rd));
                if(rd !=undefined){
                    var obj = rootRenderer.layout.getObject(point.x,point.y);
                  createElement(obj,rd.x,rd.y,rd.width);
                }
            };
             this.registerListeners=function(){
                activeCanvas.addEventListener('mousedown', this.mouseDown.bind(this));
                activeCanvas.addEventListener('mouseup', this.mouseUp.bind(this));
                activeCanvas.addEventListener('mousemove', this.mouseMove.bind(this));
                activeCanvas.addEventListener('dblclick', this.doubleClick.bind(this));
            };

            function initializeContext(canvasElement){
                var ctx = canvasElement.getContext("2d");
                return ctx;
            };

            this.__init=function(params){
                rootElement = getElement(params.containerId);
                activeCanvas = bindCanvas(params,rootElement);
                actx = initializeContext(activeCanvas);
                rootRenderer = new LayoutRenderer(actx,{width:activeCanvas.width,height:activeCanvas.height,canvas1:activeCanvas});
                this.registerListeners();
            };
            this.diagram = undefined;
            this.showDiagram=function(diagram){
                this.diagram = diagram;
                rootRenderer.setDiagram(diagram);
            };
           // this.__init(params);
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
            this.parent=undefined;
            this.rendererData={};
            this.leafs = [];
            this.__init =function(params) {
                if (params != undefined) {
                this.rendererData = (params.rendererData || {x: 50, y: 50, width: 150, height: 40});
                if (params.name != undefined) {
                    this.name = params.name;
                }
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

        Lifeline:function(params){
            this.rendererName = 'Lifeline';
            this.__init(params);
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
        extend(lib.Lifeline,new lib.UObject());
    }(global.UmlLib);

})(this);