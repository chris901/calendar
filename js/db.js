
 var indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB,
        IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction,
        IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
 var yearMonth = sessionStorage.getItem("yearMonth"),
     cDay = sessionStorage.getItem("cDay"),
     cWeek = sessionStorage.getItem("cWeek"),
     memoTime=document.getElementsByClassName("memo_time")[0],
     iconBox=document.getElementsByClassName("iconBox"),
     selecteIcon;
    renderMemo()
    justifyIndexDEB();        //判断是否支持indexedDB执行下面函数
    renderAlter()
 function renderMemo(){
     if(memoTime){
         var content=' <div class="mTime" id="mo">'+yearMonth+'</div>' +
             '    <div class="mTime">'+cDay+cWeek+'</div>';
         memoTime.innerHTML=content;
         selecteIcon=iconBox[0].firstChild.innerHTML;
     }
     for(var i=0;i<iconBox.length;i++){
         iconBox[i].onclick=function(){
             for(var j=0;j<iconBox.length;j++){
                 iconBox[j].removeAttribute("select");
                 iconBox[j].firstChild.removeAttribute("select");
             }
             this.setAttribute("select","selected");
             this.firstChild.setAttribute("select","selected");
             selecteIcon=this.firstChild.innerHTML;
         }
     }
 }
 function renderAlter(){
     var detailTitle=document.getElementsByClassName("detail-title")[0],
         detailContent=document.getElementsByClassName("detail-content")[0],
         topAlter=document.getElementsByClassName("top_alter")[0],
         bottomDelete=document.getElementsByClassName("delete")[0];
     var title = localStorage.getItem("detailTitle");
     var content = localStorage.getItem("detailContent");
     var Id = localStorage.getItem("detailId");
     if(typeof detailTitle !=="undefined"){
         detailTitle.value=title;
         detailTitle.setAttribute("data_id",Id);
         detailContent.value=content;
         var dataId=parseInt(detailTitle.getAttribute("data_id"));
         //点击修改按钮
         topAlter.onclick=function () {
             var transaction=db.transaction("chart",'readwrite');
             var objectStore=transaction.objectStore("chart");
             var request=objectStore.get(dataId);
             request.onsuccess=function(e){
                 var chart=e.target.result;
                 chart.title=detailTitle.value;
                 chart.content=detailContent.value;
                 objectStore.put(chart);
             };
             window.location.href="./index.html";
         }
         bottomDelete.onclick=function(){
             deleteDataByKey(dataId)
             window.location.href="./index.html";
         }
     }else{
         return;
     }
 }
 function justifyIndexDEB(){
    if("indexedDB" in window) {
        // 支持
        createdatabase()   //创建数据库
    } else {
        // 不支持
        console.log("不支持indexedDB...");
    }
}
function createdatabase() {
    var confirmBtn=document.getElementsByClassName("top_confirm")[0];
    var resource = window.indexedDB.open("managerDB",1);//创建一个名为managerDB的数据库，数量为1
    resource.onupgradeneeded = function(event) {//第一次创建数据库新建一张名为chart的数据表
        var db = resource.result;
        var objectStore=db.createObjectStore('chart',{
            keyPath:"Id",
            autoIncrement:true
        })

        objectStore.createIndex("time", "time",{unique:false});

    };
    resource.onsuccess = function(event) {
        console.log("数据库打开成功");
        db = event.target.result;//让数据库能在任何地方访问

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
function save(db) {
    var contact = new Object();//新建一个对象
    var Title = document.getElementsByClassName("text-title")[0].value;
    var Content = document.getElementsByClassName("text-content")[0].value;
    if(JTrim(Title) != "") {//JTrim()函数是用于判断输入是否为空值
        contact.title = Title;
        contact.time= yearMonth;
        contact.content=Content;
        contact.icon=selecteIcon;
        var transaction = db.transaction(["chart"],"readwrite");//读写
        var resource = transaction.objectStore("chart").add(contact);//利用put()将数据存入
        window.location.href="./index.html";//跳转
    } else {
        alert("you should write something...");
        return;
    }
    resource.onsuccess = function(event) {//成功
        console.log("create note success!");
    };
    resource.onerror = function(event) {//失败
        alert("can't create database,error:" + resource.error);//告知错误
    };
}
function JTrim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
}
 //查询单条数据游标与index结合查询 IDBKeyRange
 function searchRender(element) {
     var objectStore = db.transaction("chart").objectStore("chart");
     var index = objectStore.index("time");
     var request=index.openCursor(IDBKeyRange.only(element));
       /*  index.get(element).onsuccess = function(event) {
             console.log(event.target.result.title);//只能查询一个
         };
*/
     request.onsuccess = function(event) {
         var details=document.getElementsByClassName("details")[0];
         var cursor = event.target.result;
        // details.innerHTML='';
         if(cursor) {
             var listItem = document.createElement('li');
             listItem.className="detailsLi";
             listItem.id=cursor.value.Id;
             listItem.innerHTML = '<i class="iconfont">'+cursor.value.icon+'</i> &nbsp;'+cursor.value.title;
             details.appendChild(listItem);
             cursor.continue();
         } else {
             alterLi()
             loadAll()
         }
     };
 }
 //两js传输局中间函数
 function renderDataByKey(value){
     var transaction=db.transaction("chart",'readwrite');
     var objectStore=transaction.objectStore("chart");
     var request=objectStore.get(value);
     request.onsuccess=function(e){
         var chart=e.target.result;
         localStorage.setItem("detailTitle",chart.title);
         localStorage.setItem("detailContent",chart.content);
         localStorage.setItem("detailId",chart.Id);
     };
 }
 //删除数据一条
 function deleteDataByKey(value){
     var transaction=db.transaction("chart",'readwrite');
     var store=transaction.objectStore("chart");
     store.delete(value);
 }

 //遍历全部数据
 function loadAll() {
     var transaction = db.transaction(["chart"],"readonly");
     var resource = transaction.objectStore("chart").openCursor();
     var arr=[];
     resource.onsuccess = function(event) {
         //创建游标
         var cursor = event.target.result;
         //利用游标对数据进行遍历
         if(cursor) {
             var list = cursor.value;
            arr.push(list.time);
             cursor.continue();//继续循环
         } else {//游标循环到底之后，打印出str
             //console.log(arr.indexOf(val));
             //引用双重循环，找到最终值，逻辑问题，纠结了很久
             var listDay=document.getElementsByClassName("listDay");
             for(var s=0;s<listDay.length;s++){
                 var matchTime=listDay[s].getAttribute("data-time");
                 //listDay[s].removeAttribute("isSelected");
                 for(var k=0;k<arr.length;k++){
                     if(arr[k].indexOf(matchTime)!=-1){
                        if(matchTime==arr[k]){
                            listDay[s].setAttribute("isSelected","selected");
                        }
                     }
                 }

             }
         }
     };

     resource.onerror = function(event) {//出现错误给出提示
         alert("can't create database,error:" + resource.error);
     };
 }
