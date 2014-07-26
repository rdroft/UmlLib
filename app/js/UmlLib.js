/**
 * Created by rpashniev on 22.07.2014.
 */
'use strict';
(function(global){
   var Util = {
       extend: function (child, parent) {
           child.prototype = parent;
           child.prototype.constructor = child;
           return child;
       },
       fonts:{
           a1:'Georgia, serif',
           a2:'Times New Roman',
           a3:'Comic Sans MS'
       }
   }
   var Renderer = function($factory,$rootRenderer){
         this.draw = function(obj,ld){}
    };

    /**Layout
     * Diagram Layout manager
     * @constructor
     *
     * */
    var Layout = function(rendererInstance){
        var renderer = rendererInstance;
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
                 map[j]= this.findPlace(100,25);
               }else{
                  map[j] = root.leafs[j].rendererData;
               }
            }
        };
        this.findPlace=function(w,h){
          return {x:100,y:100,width:w,height:h};
        };
        this.setDraggedObjectGd=function(gd){
             draggedObjectId = gd;
        };
        this.getDraggedObjectGP=function(){
            return draggedObjectId;
        }
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
        this.update=function(){
            renderer.redraw();
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
        this.rendererFactory = new BaseRendererFactory(this);
        this.layout = new Layout(this);
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
            ctx.font = '15px '+Util.fonts.a3;
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
 /**Renderer Factory
  * @constructor
  * Factory creates Renderer Family
  * contains renderer for each object type
  * */
    var BaseRendererFactory =function($rootRenderer){
        var renders={};
        var rootRenderer = $rootRenderer;
        this.getRenderer=function(name){
            return renders[name];
        };
        this.addRenderer=function(name,renderer){
            renders[name]= new renderer(this,rootRenderer);
        };
        this.addRenderer('BaseObject',function(factory,root){
            var text_margin={
               right:10.5,
               left:3,
               top:14.5
            };

            this.draw = function(obj,gd,ctx) {
                var txt_m = ctx.measureText(obj.name);
                if(txt_m.width>(gd.width-text_margin.right)){
                   gd.width = txt_m.width+text_margin.right+text_margin.left;
                }
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
                if(sy>dy+src.height+30){
                    sy=src.y;
                    dy=dst.y+dst.height;
                }else if((sy<dy-dst.height-30)){
                    sy=src.y+src.height;
                    dy=dst.y;
                 //   ctx.strokeStyle = '#ff0000';
                }else {
                   // ctx.strokeStyle = '#00ff00';
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
    var SequenceRendererFactory = function($rootRenderer){};
    var ClassRendererFactory = function($rootRenderer) {
        this.addRenderer('Class', function () {

        });
    };
    Util.extend(SequenceRendererFactory,new BaseRendererFactory());
    Util.extend(ClassRendererFactory,new BaseRendererFactory());

    var DiagramRendererFactory = function(){
      this.factories={};
      this.getInstance=function(diagramType){
         return this.factories[diagramType];
      };
    };

    var ViewController = function(clayout){
        var layout = clayout;
        this.mouseDown=function(point){
            var gp = layout.getGP(point.x,point.y);
            if (gp !=undefined){
                gp.dragged = true;
            };
            layout.setDraggedObjectGd(gp);
        };
        this.mouseUp=function(point){
            layout.setDraggedObjectGd(undefined);
        };

        this.mouseMove = function(point){
            var rd = layout.getDraggedObjectGP();
            if(rd!=undefined){
                rd.x=point.x-rd.ox;
                rd.y=point.y-rd.oy;
                layout.update();
            }
        };
        this.doubleClick=function(point){
            var rd = layout.getGP(point.x,point.y);
            console.log('double +x:' +JSON.stringify(point)+'  ' +JSON.stringify(rd));
            if(rd !=undefined){
                var obj = layout.getObject(point.x,point.y);
                view.createElement(obj,rd.x,rd.y,rd.width,function(){
                    layout.update();
                });
            }
        };
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
            var controller;
            function getElement(elementId){
                return document.getElementById(elementId);
            };
            this.getMousePosition = function (event) {
                var rect = activeCanvas.getBoundingClientRect();
                var rx = event.clientX - rect.left;
                var ry = event.clientY - rect.top;
                return {x: rx, y: ry};
            };

            this.createElement=function(obj,x,y,w,callback){
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
                        var cte = document.getElementById(rootElement.id);
                        if(cte){
                            el.somef=true;
                            cte.removeChild(el);
                        }
                        callback();
                    }
                }.bind(this));
                el.addEventListener('blur',function(event){
                    obj.name=el.value;
                    console.log('blur');
                    if(!el.somef){
                        document.getElementById(rootElement.id).removeChild(el);
                    }
                    callback();
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

             this.registerListeners=function(controller){
                activeCanvas.addEventListener('mousedown', function (event) {
                    controller.mouseDown(this.getMousePosition(event));
                }.bind(this));
                activeCanvas.addEventListener('mouseup', function(event){
                    controller.mouseUp(this.getMousePosition(event));
                }.bind(this));
                activeCanvas.addEventListener('mousemove', function(event){
                    controller.mouseMove(this.getMousePosition(event));
                }.bind(this));
                activeCanvas.addEventListener('dblclick',function(event){
                    controller.doubleClick(this.getMousePosition(event));
                }.bind(this));
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
                controller  = new ViewController(rootRenderer.layout,this);
                this.registerListeners(controller);
            };
            this.diagram = undefined;
            this.showDiagram=function(diagram){
                this.diagram = diagram;
                rootRenderer.setDiagram(diagram);
            };
            this.__init(params);
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
        Class:function(params){
          this.rendererName='Class';
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
    var init = function(lib){
        Util.extend(lib.SequenceDiagram, new lib.Diagram());
        Util.extend(lib.Lifeline,new lib.UObject());
        Util.extend(lib.Class,new lib.UObject());
    }(global.UmlLib);

})(this);