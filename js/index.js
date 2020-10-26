function Bomb (tr, td, bombNum) {
    this.tr = tr //行数
    this.td = td //列数
    this.bombNum = bombNum //雷的数量

    this.squares = [] //二维数组，存储所有方块信息，按行与列顺序排放，存取都使用行列的形式
    this.tds = [] //存储所有单元格的DOM 
    this.surPlusBomb = bombNum //剩余雷的数量
    this.allright = false //右击标的小红旗是否全是雷，用来判断用户是否游戏成功

    this.parent = document.querySelector('.chess-board') //找到棋盘节点
}

//生成n个不重复的数字
Bomb.prototype.randomNum = function () {
    var bombSquare = []
    var square = new Array(this.tr * this.td)   //生成一个空数组，但是有长度，长度为格子的总数
    for(var i = 0; i < square.length; i++){
        square[i] = i
    }
    square.sort(function () {return 0.5 - Math.random()})   //取随机数
    console.log(square)
    for(var j in square){
        if(square[j] != 0){
            bombSquare.push(square[j])
        }
    }
    console.log(bombSquare)
    console.log(bombSquare.slice(0,this.surPlusBomb))
    return bombSquare.slice(0 , this.surPlusBomb) //返回当前剩余的雷数
}

//生成雷
Bomb.prototype.init = function (index) {

    //用来重置重新开始后的剩余雷数显示和棋盘中的雷数
    if(index == 0){
        this.surPlusBomb = 10
    }else if(index == 1){
        this.surPlusBomb = 40
    }else if(index == 2){
        this.surPlusBomb = 99
    }

    var rn = this.randomNum()   // 雷在格子里的位置
    var n = 0 // 用来找到对应格子的索引
    for(var i = 0; i < this.tr; i++){
        this.squares[i] = []
        for(var j = 0; j < this.td; j++){
            n++
            // 取一个方块在数组里的数据时要用行列的方式取，找方块周围的方块的时候要用坐标的方式去取，行列与坐标的形式x与y恰好相反
            if(rn.indexOf(n) != -1){// 如果这个条件成立，说明这个索引对应的就是雷
                this.squares[i][j] = {type:'bomb',x:j,y:i}
            }else{
                this.squares[i][j] = {type:'number',x:j,y:i,value:0}
            }
        }
    }
    // this.randomNum()
    this.updateNum()
    this.createDom()

    this.parent.oncontextmenu = function () {
        return false
    }

    //剩余雷数
    this.bombNum = document.querySelector('.bombNum')
    this.bombNum.innerHTML = this.surPlusBomb
}

//用来创建表格
Bomb.prototype.createDom = function () {
    var This = this
    var table = document.createElement('table')
    for(var i = 0; i < this.tr; i++){//循环行
        var domTr = document.createElement('tr')
        this.tds[i] = []
        for(var j = 0; j < this.td; j++){//列
            var domTd = document.createElement('td')
            domTd.pos = [i,j]  //把格子对应的行与列存到格子身上，为了下面通过这个值去数组里取到数据
            domTd.onmousedown = function () {
                This.play(event, this)
            }
            this.tds[i][j] = domTd  //这里是把所有创建的TD添加到数组当中
            domTr.appendChild(domTd)
        }
        table.appendChild(domTr)
    }
    this.parent.innerHTML = ''  //把上一次页面中的内容清空避免同时出现
    this.parent.appendChild(table)
}

//获取一个格子周围的所有格子
Bomb.prototype.getAround = function (square) {
    var x = square.x
    var y = square.y
    var result = [] //把找到的格子的坐标返回出去（二维数组）

    // x-1,y-1 x,y-1 x+1,y-1
    // x-1,y   x,y   x+1,y
    // x-1,y+1 x,y+1 x+1,y+1

    for(var i = x - 1; i <= x + 1; i++){
        // x[i] = []
        for(var j = y - 1; j <= y+1; j++){
            if(
                i < 0 ||    //格子超出左边范围
                j < 0 ||    //格子超出上边范围
                i > this.td - 1 ||  //格子超出右边范围
                j > this.tr - 1 ||  //格子超出下边范围
                (i == x & j == y) ||    //当前循环到的格子是自己
                this.squares[j][i].type == 'bomb'   //周围循环到的格子是雷
            ){
                continue    //跳出循环
            }
            result.push([j,i])  //要以行列的形式返回出去，因为后面要用它取数组中的数据
        }
    }
    return result
}

//更新所有周围有雷的格子的数字
Bomb.prototype.updateNum = function () {
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'number'){
                continue    //跳出循环
            }
            var num = this.getAround(this.squares[i][j])    //获取到每一个雷周围的数字
            for(var k = 0; k < num.length; k++){
                this.squares[num[k][0]][num[k][1]].value += 1
            }
        }
    }
    // console.log(this.squares)
}

//play方法
Bomb.prototype.play = function (ev,obj) {
    var This = this
    if(ev.which == 1 && obj.className != 'flag'){  //点击的是左键，第二个条件是为了限制用户已标注的小红旗不能被左键点击
        var curSquare = this.squares[obj.pos[0]][obj.pos[1]]
        var cl = ['zero','one','two','three','four','five','six','seven','eight']
        if(curSquare.type == 'number'){  //用户点到的是数字
            obj.innerHTML = curSquare.value
            obj.className = cl[curSquare.value]
            if(curSquare.value == 0){   //用户点到的是0
                obj.innerHTML = ''  //如果数字为0则不显示
                //点到0之后以这个格子为中心找周围格子是否有0如果有则继续找0，如果周围没有0则不继续找，找到0或者找不到0都要将四周的数字显示出来
                function getAllZero (square) {
                    var around = This.getAround(square) //找到周围的n个格子
                    for(var i = 0; i < around.length; i++){
                        var x = around[i][0]
                        var y = around[i][1]

                        This.tds[x][y].className = cl[This.squares[x][y].value]
                        if(This.squares[x][y].value == 0){  //如果周围的格子为0就把所有为0的格子显示出来
                            if(!This.squares[x][y].check){  
                                //因为没有.check属性，前面加!，这个条件就成立了
                                //给对应的格子添加check属性，如果格子被找过则check为true，防止格子下次再被循环
                                //.check为true之后，下次再找到这个格子，上面的条件就不成立了，所以就不会再次被循环了
                                This.squares[x][y].check = true
                                getAllZero(This.squares[x][y])
                            }
                        }else{  //如果周围格子数不为0就把数字显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value
                        }
                    }
                }
                getAllZero(curSquare)
            }
        }else{  //用户点到的是雷
            this.gameOver(obj)
            setTimeout(function timer(){
                alert('很遗憾，游戏结束！')
            },120)
        }
    }
    if(ev.which == 3){  //用户点击的是右键
        //如果右击的是一个数字那就不能点击
        if(obj.className && obj.className != 'flag'){
            return
        }
        obj.className = obj.className == 'flag'?'':'flag'   //切换class的有和无
        if(this.squares[obj.pos[0]][obj.pos[1]].type == 'bomb'){
            this.allright = true    //用户标注的小红旗背后都是雷
        }else{
            this.allright = false
        }
        //用来实现标注小红旗，和取消标注小红旗
        if(obj.className == 'flag'){
            this.bombNum.innerHTML = --this.surPlusBomb
        }else{
            this.bombNum.innerHTML = ++this.surPlusBomb
        }
        if(this.surPlusBomb == 0){
            //表示用户已经标完全部小红旗，此时判断游戏是否结束
            if(this.allright == true){
                //表示用户的小红旗全部标注对了
                setTimeout(function timer(){
                    alert('恭喜你，顺利通关！')
                },120)
            }else{
                setTimeout(function timer(){
                    alert('很遗憾，游戏结束！')
                },120)
                this.gameOver()
            }
        }
    }
}

//游戏结束方法
Bomb.prototype.gameOver = function (clickTd) {
    // 1.显示所有的雷
    // 2.取消所有格子的点击事件
    // 3.给点中的雷添加样式
    for(var i = 0; i < this.tr; i++){
        for(var j = 0; j < this.td; j++){
            if(this.squares[i][j].type == 'bomb'){
                this.tds[i][j].className = 'bomb'
            }
            this.tds[i][j].onmousedown = null
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor = '#f00'
    }
}

//button的功能
var btns = document.querySelectorAll('.game-btns button')
var bomb = null //用来存储生成的实例
var ln = 0  //用来处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[28,28,99]]  //用来存储棋盘的尺寸及雷数
for(let i = 0; i < btns.length - 1; i++){
    btns[i].onclick = function(){
        btns[ln].className = ''
        this.className = 'selected'
        ln = i
        bomb = new Bomb(...arr[i])
        bomb.init()
    }
}
btns[0].onclick()   //为什么可以在这里调用？因为onclick同时是一个函数
btns[3].onclick = function () {//用于重新加载游戏
    bomb.init(ln)
} 