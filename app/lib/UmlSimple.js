/**
 * Created by Roland on 12/14/13.
 */
var DiagramColours = {
    colours: {c1: '#FFEC94', c2: '#FFAEAE', c3: '#FFF0AA', c4: '#B0E57C', c5: '#B4D8E7', c6: '#56BAEC'},
    scheme3: {background: '#ffffff', block: '#FFF0AA', text: '#000000'},
    scheme1: {background: '#ffffff', block: '#56BAEC', text: '#000000'},
    scheme2: {background: '#ffffff', block: '#B4D8E7', text: '#000000'}

}

//{parent,w,h,color}
function Diagram(config) {
    this.objects = [];
    this.isDragged = false;
    this.draw = function () {
        this.ctx.fillStyle = DiagramColours.scheme1.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.objects != undefined) {
            for (var x in this.objects) {
                this.objects[x].draw(this.ctx);
            }
        }
    }
    this.addUObject = function (uobject) {
        if (uobject != undefined) {
            console.log('put--: ' + uobject + '  x:' + uobject.classname + "  xx:" + uobject.name);
            this.objects.push(uobject);
        }
    }
    this.container={};
    this.__init = function (config) {
        var canvas = document.createElement("canvas");
        canvas.width = config.w;
        canvas.height = config.h;
        this.container = config.parent;
        this.ctx = canvas.getContext("2d");
        if (config.colour != undefined) {
            this.ctx.fillStyle = config.colour;
        } else {
            this.ctx.fillStyle = DiagramColours.scheme1.background;
        }
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        var parent = document.getElementById(config.parent);
        parent.appendChild(canvas);
        canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        canvas.addEventListener('dblclick',this.doubleclick.bind(this));

        canvas.addEventListener('mouseover', function (event) {
            console.log('onmouseover' + event);
        }.bind(this));

        canvas.addEventListener('dragstart',function(event){
            console.log('drag');
        });

        canvas.addEventListener('dragmove',function(event){
            console.log('dragmove');
        });
        this.canvas = canvas;//store ref
    }
    this.getMousePosition = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var rx = event.clientX - rect.left;
        var ry = event.clientY - rect.top;
        return {x: rx, y: ry};
    }
    //{x,y}
    this.findUObject = function (point) {
        for (var x in this.objects) {
            var ox = this.objects[x].x;
            var oxd = ox + this.objects[x].width;
            var oy = this.objects[x].y;
            var oyd = this.objects[x].height;
            if (point.x > ox & point.x < oxd) {
                console.log("found x" + this.objects[x].toString());
                if (point.y > oy & point.y < oyd) {
                    console.log("found x" + this.objects[x].toString());
                    return {obj:this.objects[x],ox:point.x-ox,oy:point.y-oy,pos:x};
                }
            }
        }
        return null;
    }

    this.sr={};
    this.mouseDown = function (event) {
        var pos = this.getMousePosition(event);
        var uobj = this.findUObject(pos);
        if (uobj != undefined) {
            console.log("object selected:"+uobj.obj.id+" pos:"+uobj.pos);
            uobj.obj.isDragged = true;
            this.sr=uobj;
        }
    }
    this.mouseUp = function (event) {
        var pos = this.getMousePosition(event);
        if (this.sr != undefined) {
            this.sr.obj.isDragged = false;
            this.sr.obj.x = pos.x-this.sr.ox;
            this.sr.obj.y = pos.y-this.sr.oy;
            this.draw();
            this.sr.obj.draw(this.ctx);
            this.sr = null;
        }
    }
        this.doubleclick=function(event){
            var pos = this.getMousePosition(event);
            var uobj = this.findUObject(pos);
            if (uobj != undefined) {
                console.log("object selected:"+uobj.obj.id+" pos:"+uobj.pos);
                uobj.obj.isDragged = false;
                this.sr=uobj;
                var el=document.createElement('input');
                el.type='text';
                el.value=uobj.obj.name;
                var s = 'position:absolute;'+'top:'+uobj.obj.y+'px;';
                el.style.position='absolute';
                el.style.top=uobj.obj.y+'px';
                el.style.left=uobj.obj.x+'px';
                el.style.width=uobj.obj.width+'px';
                el.addEventListener('keyup',function(event){
                    if(event.keyCode==13||event.which==13){

                      uobj.obj.name=el.value;
                      uobj.obj.draw(this.ctx);
                        console.log("redr");
                      var cte =  document.getElementById(this.container);
                        if(cte){
                            el.somef=true;
                            cte.removeChild(el);
                        }

                    }
                }.bind(this));
                el.addEventListener('blur',function(event){
                    uobj.obj.name=el.value;
                    console.log('blur');
                    if(!el.somef){
                    document.getElementById(this.container).removeChild(el);
                    }
                }.bind(this));
                document.getElementById(this.container).appendChild(el);
                el.focus();
            }
        }


    this.mouseMove = function (event) {
        var pos = this.getMousePosition(event);
        if (this.sr&&this.sr.obj) {
            if (this.sr.obj.isDragged == true) {
                this.sr.obj.x = pos.x-this.sr.ox;
                this.sr.obj.y = pos.y-this.sr.oy;
                this.draw();
                this.sr.obj.draw(this.ctx);
            }
        }
    }
    this.__init(config);
}
function UObject(props) {
    this.classname = "object";
    this.name = "name";
    this.dc = DiagramColours.scheme1;
    this.colour = this.dc.block;
    this.textColour = this.dc.text;
    this.isDragged = false;
    this.__init(props);
    this.drawName = function (ctx) {
        ctx.strokeStyle = this.textColour;
        ctx.font = "11px Georgia";
        ctx.compos
//        ctx.fillStyle =DiagramColours.scheme1.background;
//        ctx.shadowEnabled=false;
//        ctx.shadowBlur=0;
//        ctx.shadowOffsetY=0;
//        ctx.shadowOffsetX=0;
//        ctx.fillRect(this.x+12, this.y+7, this.width-14, 9);
        ctx.fillStyle = "blue";

        ctx.fillText(this.name, this.x + 12, this.y + 13);
    }
    this.draw = function (ctx) {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.drawName(ctx);
    }
}
//UObject.prototype.draw=function(){}
UObject.prototype.hide = function () {
    console.log(this.classname + " hide");
}
//{id:0,x:10,y:20,50,200}
UObject.prototype.__init = function (config) {
    if (config != undefined) {
        this.id = config.id;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        if (config.block != undefined) {
            this.colour = config.block;
        }
    } else {
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 100;
        this.visible = true;
    }
}

UObject.prototype.toString = function () {
    return this.id + 's[' + this.x + " " + this.y + " " + this.width + " " + this.height + ']';
}
function LifeLine(config) {
    this.classname = "lifeline";
    this.boxHeight = 21;
    if (config != undefined) {
        this.name = config.id;
    }
    this.__init(config);
    this.draw = function (ctx) {
        //ctx.fillStyle = this.colour;
        ctx.fillStyle     = DiagramColours.scheme1.background;
        ctx.shadowEnabled=false;
        ctx.shadowBlur=0;
        ctx.shadowColor=DiagramColours.scheme1.background;
        ctx.fillRect(this.x, this.y, this.width, this.boxHeight);
        this.drawName(ctx);

        ctx.strokeStyle = "#a00000";
        //ctx.fillRect(this.x, this.y, this.width, this.boxHeight);
        ctx.shadowOffsetX=3;
        ctx.shadowOffsetY=3;
        ctx.shadowBlur    = 4;
        ctx.shadowColor   = 'rgba(0, 0, 0, 0.5)';
        ctx.fillStyle     = '#00f';
        ctx.strokeRect(this.x, this.y, this.width, this.boxHeight);

        ctx.beginPath();
        ctx.moveTo(this.x + (this.width / 2), this.y + this.boxHeight);
        ctx.lineTo(this.x + (this.width / 2), this.height);
        ctx.stroke();
      //  console.log("real draw: x:" + this.x + " y:" + this.y + " w:" + this.width + " h:" + this.height);
    }
}

LifeLine.prototype = new UObject();
LifeLine.prototype.constructor = LifeLine;