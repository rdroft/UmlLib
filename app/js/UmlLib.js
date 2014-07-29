/**
 * Created by rpashniev on 22.07.2014.
 */
'use strict';
(function (global) {
    var Util = {
        extend: function (child, parent) {
            child.prototype = parent;
            child.prototype.constructor = child;
            return child;
        },
        fonts: {
            a1: 'Georgia, serif',
            a2: 'Times New Roman',
            a3: 'Comic Sans MS'
        }
    }
    /**Layout
     * Diagram Layout manager
     * @constructor
     * */
    var Layout = function (canvasConfig,diagram) {
        this.canvasConfig = canvasConfig;
        this.rfactory = undefined;
        this.width = this.canvasConfig.activeCanvas.width;
        this.height = this.canvasConfig.activeCanvas.height;
        this.diagram = diagram;
        this.mouseObj = {
            id: -2,
            rd: {x: 0, y: 0, width: 0, height: 0},
            type: 'mouse'
        };
        var map = []; //LayoutData hire
        var leafs = [];
        var draggedObjectId = undefined;
        var __init=function(diagram){
            map = diagram.lp;
            leafs = diagram.leafs;
            this.rfactory = new (FactoryList.getFactory(diagram.type))(this);
            this.updateAll();
        }.bind(this);

        this.getById = function (id) {
            return map[id];
        };

        this.addNew = function (obj, gd) {
            obj.id = leafs.length;
            gd.id = map.length;
            map.push(gd);
            leafs.push(obj);
        };

        this.setDiagram = function (root) {
            this.updateAll();
        };

        this.setDraggedObjectGd = function (gd) {
            if(gd===undefined){
                if(draggedObjectId){
                    draggedObjectId.ox=undefined;
                    draggedObjectId.oy=undefined;
                    draggedObjectId.dragged=undefined;
                }
            }
            draggedObjectId = gd;
        };

        this.getDraggedObjectGP = function () {
            return draggedObjectId;
        };

        this.getGP = function (x, y) {
            for (var v in map) {
                var gd = map[v];
                if (gd.x <= x && x <= gd.x + gd.width) {
                    if (gd.y <= y && y <= (gd.y + gd.height)) {
                        map[v].ox = x - gd.x;
                        map[v].oy = y - gd.y;
                        return map[v];
                    }
                }
            }
            return undefined;
        };

        this.getObject = function (x, y) {
            for (var v = 0; v < map.length; v++) {
                var gd = map[v];
                if (gd.x <= x && x <= gd.x + gd.width) {
                    if (gd.y <= y && y <= (gd.y + gd.height)) {
                        return leafs[v];
                    }
                }
            }
            return undefined;
        };
        this.updateById = function (id) {
            if (id) {
                //this.rfactory.getRenderer(leafs[id].type).draw(leafs[id],map[id],this.canvasConfig.activeCtx);
                this.updateAll();
            } else {
                this.updateAll();
            }
        };
        this.updateAll = function () {
            this.canvasConfig.activeCanvas.width = this.canvasConfig.activeCanvas.width;
            this.rfactory.getRenderer('Diagram').draw(this.diagram, {}, this.canvasConfig.activeCtx);
            for (var j = 0; j < leafs.length; j++) {
                if (leafs[j]) {
                    this.rfactory.getRenderer(leafs[j].type).draw(leafs[j], map[j], this.canvasConfig.activeCtx);
                }
            }
        };
        __init(diagram);
    };
    /**  Renderer
     * Renderer Factory
     * @constructor
     * Factory creates Renderer Family
     * contains renderer for each object type
     **/
    var BaseRendererFactory = function (__layout) {
        this.renders = {};
        this.layout = __layout;
        this.getRenderer = function (name) {
            return this.renders[name];
        };
        this.addRenderer = function (name, renderer) {
            this.renders[name] = new renderer(this, this.layout);
        };
        this.addRenderer('BaseObject', function (factory, layout) {
            var text_margin = {
                right: 10.5,
                left: 3,
                top: 14.5
            };
            this.drawMenu = function (obj, gd, ctx) {
                ctx.fillRect(gd.x + gd.width - 4, gd.y, 4, 4);
            };
            this.draw = function (obj, gd, ctx) {
                var txt_m = ctx.measureText(obj.name);
                if (txt_m.width > (gd.width - text_margin.right)) {
                    gd.width = txt_m.width + text_margin.right + text_margin.left;
                }
                ctx.fillText(obj.name, gd.x + 10.5, gd.y + 14.5);
                ctx.strokeRect(gd.x, gd.y, gd.width, gd.height);
                if (obj.leafs != undefined) {
                    //call attribute renderer
                    for (var i in obj.leafs) {
                    }
                }
                this.drawMenu(obj, gd, ctx);
            };
        });
        this.addRenderer('Connector', function (factory, layout) {
            this.draw = function (obj, gd, ctx) {
                var src = layout.getById(obj.from);
                var dst = obj.to == layout.mouseObj.id ? layout.mouseObj.rd : layout.getById(obj.to);
                var sx = src.x + src.width / 2;
                var sy = src.y + src.height / 2;
                var dx = dst.x + dst.width / 2;
                var dy = dst.y + dst.height / 2;

                if ((sy - src.height) > dy) {
                    sy = src.y;
                    dy = dst.y + dst.height;
                    //ctx.strokeStyle = '#0000ff';
                } else if ((sy < (dy - dst.height))) {
                    sy = src.y + src.height;
                    dy = dst.y;
                    //ctx.strokeStyle = '#ff0000';
                } else {
                    if (sx < dx) {
                        // ctx.strokeStyle = '#00ff00';
                        dx = dst.x;
                        sx = src.x + src.width;
                    } else {
                        //  ctx.strokeStyle = '#00a1aa';
                        dx = dst.x + dst.width;
                        sx = src.x;
                    }
                }
                ctx.beginPath();
//                if(obj.to==-2){
//                    console.log('okk x:'+sx+' y: '+sy+'    to x:'+dx+' y:'+dy);
//                }
                ctx.moveTo(sx, sy);
                ctx.lineTo(dx, dy);
                ctx.stroke();

            };
        });
        this.addRenderer('Lifeline', function (factory, layout) {
            this.draw = function (obj, gd, ctx) {
                if (gd.lineHeight === undefined) {
                    gd.lineHeight = 300;
                }
                var startLineX = gd.x + (gd.width / 2);
                ctx.fillText(obj.name, gd.x + 10.5, gd.y + 14.5);
                ctx.strokeRect(gd.x, gd.y, gd.width, gd.height);
                ctx.beginPath();
                ctx.moveTo(startLineX, gd.y + gd.height);
                ctx.lineTo(startLineX, gd.y + gd.lineHeight);
                ctx.stroke();
            };
        });
        this.addRenderer('Diagram', function (factory, layout) {
            this.drawGrid = function (ctx, width, height) {
                var grid_size = 50;
                var pix_s = 0.5;
                var caption = {x: 0, y: 0, h: 18.5, w1: 150.5, w2: 163.5};
                //print grid
                ctx.lineWidth = 0.4;
                for (var j = 0; j < (height / grid_size); j++) {
                    ctx.moveTo(pix_s, j * grid_size + pix_s);
                    ctx.lineTo(width - 1.5, j * grid_size + pix_s);
                }
                ;
                for (var j = 0; j < (width / grid_size); j++) {
                    ctx.moveTo(j * grid_size + pix_s, pix_s);
                    ctx.lineTo(j * grid_size + pix_s, height);
                }
                ;
                ctx.stroke();
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.moveTo(caption.x, caption.h);
                ctx.lineTo(caption.w1, caption.h);
                ctx.lineTo(caption.w2, caption.y);
                ctx.lineTo(caption.x, caption.y);
                ctx.lineTo(caption.x, caption.h);
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.fillStyle = 'black';
                ctx.stroke();
            };
            this.draw = function (obj, gd, ctx) {
                if(layout) {
                    this.drawGrid(ctx, factory.layout.width, factory.layout.height);
                }
                ctx.font = '15px ' + Util.fonts.a3;
                ctx.fillText(obj.type + ' ' + obj.name, 12.5, 13.5);
            };
        });
    };
    var SequenceRendererFactory = function (__layout) {
        this.layout = __layout;
        //console.log(' created '+JSON.stringify(layout));
        for(var i in this){
            console.log('p '+i);
        }
    };
    var ClassRendererFactory = function (__layout) {
        var renders = {};
        var layout = __layout;
        this.addRenderer('Class', function () {
        });
    };
    Util.extend(SequenceRendererFactory, new BaseRendererFactory());
    Util.extend(ClassRendererFactory, new BaseRendererFactory());
    var FactoryList = {
        factories:{
            Base:BaseRendererFactory,
            Sequence:SequenceRendererFactory,
            Class:ClassRendererFactory
        },
        getFactory: function(type){
            return this.factories[type];
        }
    };
    /**ViewController
     * @constructor
     * @param {Layout} [layout]
     * */
    var ViewController = function (clayout) {
        var layout = clayout;
        this.onTop = undefined;
        this.setOnTop = function (obj) {
            this.onTop = obj;
        };
        this.mouseDown = function (point) {
            if (this.onTop === undefined) {
                var gp = layout.getGP(point.x, point.y);
                if (gp != undefined) {
                    gp.dragged = true;
                }
                layout.setDraggedObjectGd(gp);
            } else {
                if (this.onTop.type == 'Connector') {
                    var obj = layout.getObject(point.x, point.y);
                    if (obj != undefined) {
                        if (this.onTop.from === undefined) {
                            this.onTop.from = obj.id;
                            this.onTop.to = layout.mouseObj.id;
                            layout.mouseObj.rd.x = point.x;
                            layout.mouseObj.rd.y = point.y;
                            layout.setDraggedObjectGd(layout.mouseObj.rd);
                            layout.addNew(this.onTop, {});
                            layout.updateAll();
                        } else if (this.onTop.to === layout.mouseObj.id) {
                            this.onTop.to = obj.id;
                            this.onTop = undefined;
                            layout.updateAll();
                        }
                        ;
                    }
                } else {
                    layout.addNew(this.onTop, {x: point.x, y: point.y, width: 125, height: 25});
                    this.onTop = undefined;
                    layout.updateAll();

                }
            }
        };

        this.mouseUp = function (point) {
            if (layout.getDraggedObjectGP() === layout.mouseObj.rd) {
                layout.updateAll();
            } else {
                layout.setDraggedObjectGd(undefined);
            }
        };

        this.mouseMove = function (point) {
            var rd = layout.getDraggedObjectGP();
            if (rd != undefined) {
                if (rd.ox != undefined) {
                    rd.x = point.x - rd.ox;
                } else {
                    rd.x = point.x;
                }
                if (rd.oy != undefined) {
                    rd.y = point.y - rd.oy;
                } else {
                    rd.y = point.y;
                }
                layout.updateById(rd.id);
            }
        };
        this.doubleClick = function (point) {
            var rd = layout.getGP(point.x, point.y);
            console.log('double +x:' + JSON.stringify(point) + '  ' + JSON.stringify(rd));
            if (rd != undefined) {
                var obj = layout.getObject(point.x, point.y);
                view.createElement(obj, rd.x, rd.y, rd.width, function () {
                    layout.updateById(obj.id);
                });
            }
        };
    };
    global.UmlLib = {
        /** View
         * The base Graphical Component responsible for diagram presentation
         * you should crate view to place diagram
         * @constructor
         * @param {Object} params
         * @param {String} [params.containerId] mandatory ID of container
         * @param {Number} [params.width]
         * @param {Number} [params.height]
         * @param {String} [params.background];
         * */
        View: function (params) {
            var canvasConfig = {
                parentEl: undefined,
                activeCanvas: undefined,
                activeCtx: undefined
            };
            var layout;
            var controller;
            this.log = function (vx) {
                console.log(vx);
            }
            this.setOnTop = function (ojb) {
                controller.setOnTop(ojb);
            }
            function getElement(elementId) {
                return document.getElementById(elementId);
            };
            this.getMousePosition = function (event) {
                var rect = canvasConfig.activeCanvas.getBoundingClientRect();
                var rx = event.clientX - rect.left;
                var ry = event.clientY - rect.top;
                return {x: rx, y: ry};
            };

            this.createElement = function (obj, x, y, w, callback) {
                var parentId = canvasConfig.parentEl.id;
                var el = document.createElement('input');
                el.type = 'text';
                el.value = obj.name;
                el.style.position = 'absolute';
                el.style.top = y + 89 + 'px';
                el.style.left = x + 90 + 'px';
                el.style.width = (w - 10) + 'px';
                el.addEventListener('keyup', function (event) {
                    if (event.keyCode == 13 || event.which == 13) {
                        obj.name = el.value;
                        var cte = document.getElementById(parentId);
                        if (cte) {
                            el.somef = true;
                            cte.removeChild(el);
                        }
                        callback();
                    }
                }.bind(this));
                el.addEventListener('blur', function (event) {
                    obj.name = el.value;
                    //console.log('blur');
                    if (!el.somef) {
                        document.getElementById(parentId).removeChild(el);
                    }
                    callback();
                }.bind(this));
                document.getElementById(parentId).appendChild(el);
                el.focus();
            }
            function bindCanvas(params, parent) {
                var canvas = document.createElement("canvas");
                canvas.width = params.width;
                canvas.height = params.height;
                parent.appendChild(canvas);
                return canvas;
            };

            this.registerListeners = function (controller) {
                canvasConfig.activeCanvas.addEventListener('mousedown', function (event) {
                    controller.mouseDown(this.getMousePosition(event));
                }.bind(this));
                canvasConfig.activeCanvas.addEventListener('mouseup', function (event) {
                    controller.mouseUp(this.getMousePosition(event));
                }.bind(this));
                canvasConfig.activeCanvas.addEventListener('mousemove', function (event) {
                    controller.mouseMove(this.getMousePosition(event));
                }.bind(this));
                canvasConfig.activeCanvas.addEventListener('dblclick', function (event) {
                    controller.doubleClick(this.getMousePosition(event));
                }.bind(this));
            };

            function initializeContext(canvasElement) {
                var ctx = canvasElement.getContext("2d");
                return ctx;
            };

            this.__init = function (params) {
                canvasConfig.parentEl = getElement(params.containerId);
                canvasConfig.activeCanvas = bindCanvas(params, canvasConfig.parentEl);
                canvasConfig.activeCtx = initializeContext(canvasConfig.activeCanvas);
            };
            this.diagram = undefined;
            this.showDiagram = function (diagram) {
                this.diagram = diagram;
                layout = new Layout(canvasConfig,diagram);
                controller = new ViewController(layout, this);
                this.registerListeners(controller);
            };
            this.__init(params);
        },
        /**UObject
         * Base Uml Object
         * @constructor
         * @memberof UmlLib
         * @param {Object} params
         * @param {Object} [params.rd] - optional
         * @param {String} [params.name] - element Name
         * @param {String} [params.stereotype]
         * */
        UObject: function (params) {
            this.type = 'BaseObject';
            this.name = "Empty";
            this.id = -1;
            this.__init = function (params) {
                if (params && params.name) {
                    this.name = params.name;
                }
            }
            this.__init(params);
        },
        /**Class
         * Class Uml Object
         * @constructor
         * @param {Object} [params]
         * @param {String} [params.name] the class name
         * */
        Class: function (params) {
            this.attributes=[];
            this.type = 'Class';
        },
        /**Connector
         * base Uml 1:1 connector
         * @param {Number} [from] object id
         * @param {Number} [to] object id
         * @param {Object} [params] --optional
         * @param {String} [params.name] element name
         * */
        Connector: function (from, to, params) {
            this.type = 'Connector';
            if (from)
                this.from = from.id;
            if (to)
                this.to = to.id;
            this.__init = function (params) {
            }(params);
        },
        /**Lifeline
         * Base uml element for Sequence Diagram
         * @constructor
         * @param {Object} [params]
         * @param {String} [params.name]
         * */
        Lifeline: function (params) {
            this.type = 'Lifeline';
            this.__init(params);
        },
        /**
         * @constructor
         * @param {Object} [params]
         * @param {String} [params.name]
         * */
        Diagram: function (params) {
            this.name = 'Diagram'
            this.type = 'Base'
            //Child Element's
            this.leafs = [];
            //Layout properties
            this.lp = [];
            this.addObject = function (object, gd) {
                object.id = this.leafs.length;
                this.leafs.push(object);
                if(object.type=='Connector'){
                    this.lp.push({id:this.lp.length});
                }
                    this.lp.push(gd || {x: 0, y: 0, width: 100, height: 25,id:this.lp.length});
            };
            this.__init = function (params) {
                if (params != undefined) {
                    this.name = params.name;
                }
            };
            this.__init(params);
        },
        SequenceDiagram: function (params) {
            this.__init(params);
            this.type = 'Sequence';
        }
    };
    var init = function (lib) {
        Util.extend(lib.SequenceDiagram, new lib.Diagram());
        Util.extend(lib.Lifeline, new lib.UObject());
        Util.extend(lib.Class, new lib.UObject());
    }(global.UmlLib);

})(this);