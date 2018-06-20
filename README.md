# calendar
一个简单的带备忘录功能的万年历app


说明
使用原生js，适合巩固基础的一个项目



参靠网上万年历旧历，节日的算法计算技巧，app.js



imgShow可看app截图



使用indexDB存储备忘录数据，实现增删改查功能 db.js



创建indexDB关系型数据库 三部曲onupgradeneeded，.onsuccess，onerror





function createdatabase() {

    var confirmBtn=document.getElementsByClassName("top_confirm")[0];
    var resource = window.indexedDB.open("managerDB",1); //创建一个名为managerDB的数据库，数量为1
    
    resource.onupgradeneeded = function(event) { //第一次创建数据库新建一张名为chart的数据表
        var db = resource.result;
        var objectStore=db.createObjectStore('chart',{
            keyPath:"Id",
            autoIncrement:true
        })
        objectStore.createIndex("time", "time",{unique:false});
    };
    
    resource.onsuccess = function(event) {
        console.log("数据库打开成功");
        db = event.target.result; //让数据库能在任何地方访问
        
        if(confirmBtn){
            confirmBtn.onclick=function (){
                save(db)
            }
        }
    };
    resource.onerror = function(event) {//数据库创建失败事件
        alert("can't create database,error:" + resource.error);
    };
}


开发的版本一可能会有点乱，以后会继续更新
